import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AgentService } from '../agent/agent.service';
import * as WebSocket from 'ws';
import * as url from 'url';

// Extend WebSocket to include connectionId
interface ExtendedWebSocket extends WebSocket {
  connectionId?: string;
  isAlive?: boolean;
}

export interface WebSocketSession {
  sessionId: string;
  userId?: string;
  connectedAt: Date;
  lastActivity: Date;
  socket: ExtendedWebSocket;
  connectionId: string;
  metadata?: Record<string, unknown>;
}

export interface UserMessageDto {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedMessage {
  content?: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

@WebSocketGateway()
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: WebSocket.Server;

  private readonly logger = new Logger(ChatGateway.name);
  private sessions = new Map<string, WebSocketSession>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly sessionService: SessionService,
    private readonly agentService: AgentService,
  ) {}

  async handleConnection(
    client: ExtendedWebSocket,
    request: { url: string },
  ): Promise<void> {
    const query = url.parse(request.url, true).query;
    const sessionId = query.sessionId as string;

    if (!sessionId) {
      this.logger.error('Connection rejected: No session ID provided');
      client.close(4000, 'No session ID provided');
      return;
    }

    const connectionId = `${sessionId}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // Get or create session
      let session = await this.sessionService.getSession(sessionId);
      if (!session) {
        session = await this.sessionService.createSession(sessionId);
      }

      // Store WebSocket session
      const wsSession: WebSocketSession = {
        sessionId,
        userId: session.userId,
        connectedAt: new Date(),
        lastActivity: new Date(),
        socket: client,
        connectionId,
        metadata: query as Record<string, unknown>,
      };

      this.sessions.set(connectionId, wsSession);

      // Store connection ID on the client for cleanup
      client.connectionId = connectionId;
      client.isAlive = true;

      this.logger.log(
        `Client connected: ${connectionId} (Session: ${sessionId}, Total: ${this.sessions.size})`,
      );

      // Send session info
      this.sendMessage(client, {
        type: 'session_connected',
        content: '',
        metadata: {
          sessionId,
          connectionId,
          conversationHistory: session.conversationHistory,
          preferences: session.preferences,
          connectedAt: wsSession.connectedAt.toISOString(),
        },
      });

      // Set up message handler
      client.on('message', (data: WebSocket.Data) => {
        void this.handleMessage(client, data, wsSession);
      });

      // Handle ping/pong for connection health
      client.on('pong', () => {
        client.isAlive = true;
        wsSession.lastActivity = new Date();
        this.logger.debug(`Pong received from ${connectionId}`);
      });

      // Handle close event
      client.on('close', (code: number, reason: string) => {
        this.logger.log(
          `Client closed: ${connectionId} (Code: ${code}, Reason: ${reason})`,
        );
      });

      // Handle error event
      client.on('error', (error: Error) => {
        this.logger.error(`Client error: ${connectionId}`, error);
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.close(4000, 'Connection failed');
    }
  }

  handleDisconnect(client: ExtendedWebSocket): void {
    const connectionId = client.connectionId;
    if (connectionId) {
      const wsSession = this.sessions.get(connectionId);
      if (wsSession) {
        this.sessions.delete(connectionId);
        this.logger.log(
          `Client disconnected: ${connectionId} (Session: ${wsSession.sessionId}, Remaining: ${this.sessions.size})`,
        );
      }
    }
  }

  private async handleMessage(
    client: ExtendedWebSocket,
    data: WebSocket.Data,
    wsSession: WebSocketSession,
  ): Promise<void> {
    try {
      const dataString = this.parseWebSocketData(data);
      const message = JSON.parse(dataString) as ParsedMessage;

      this.logger.debug(
        `Processing message from session ${wsSession.sessionId}:`,
        { type: message.type, hasContent: !!message.content },
      );

      // Update last activity
      wsSession.lastActivity = new Date();

      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.sendMessage(client, {
            type: 'pong',
            content: '',
            metadata: { timestamp: new Date().toISOString() },
          });
          break;

        case 'user_message':
          if (message.content) {
            await this.processUserMessage(
              client,
              { content: message.content, metadata: message.metadata },
              wsSession,
            );
          } else {
            this.logger.warn('Received user_message without content');
          }
          break;

        default:
          // Backward compatibility - treat messages with content as user messages
          if (message.content) {
            await this.processUserMessage(
              client,
              message as UserMessageDto,
              wsSession,
            );
          } else {
            this.logger.warn('Unknown message format:', { type: message.type });
            this.sendMessage(client, {
              type: 'error',
              content: 'Unknown message type',
              metadata: { receivedType: message.type },
            });
          }
      }
    } catch (error) {
      this.logger.error('Error parsing message:', error);
      this.sendMessage(client, {
        type: 'error',
        content: 'Invalid message format',
        metadata: { error: 'Message parsing failed' },
      });
    }
  }

  private parseWebSocketData(data: WebSocket.Data): string {
    if (Buffer.isBuffer(data)) {
      return data.toString();
    }
    if (typeof data === 'string') {
      return data;
    }
    if (Array.isArray(data)) {
      return Buffer.concat(data).toString();
    }
    return JSON.stringify(data);
  }

  private async processUserMessage(
    client: ExtendedWebSocket,
    messageData: UserMessageDto,
    wsSession: WebSocketSession,
  ): Promise<void> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    try {
      // Save user message to session
      const userMessage = {
        id: messageId,
        role: 'user' as const,
        content: messageData.content,
        timestamp: new Date(),
        metadata: {
          ...messageData.metadata,
          connectionId: wsSession.connectionId,
        },
      };

      await this.sessionService.addMessage(wsSession.sessionId, userMessage);

      // Send thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: true, messageId },
      });

      // Get session for context
      const session = await this.sessionService.getSession(wsSession.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Process with agent
      const agentResponse = await this.agentService.processMessage(
        messageData.content,
        session.conversationHistory,
        session.context,
        {
          ...messageData.metadata,
          sessionId: wsSession.sessionId,
          connectionId: wsSession.connectionId,
        },
      );

      // Save agent response to session
      const responseMessage = {
        id: `${messageId}_response`,
        role: 'assistant' as const,
        content: agentResponse.content,
        timestamp: new Date(),
        metadata: {
          ...agentResponse.metadata,
          responseToMessageId: messageId,
        },
      };

      await this.sessionService.addMessage(
        wsSession.sessionId,
        responseMessage,
      );

      // Send response to client
      this.sendMessage(client, {
        type: 'agent_response',
        content: agentResponse.content,
        metadata: {
          ...agentResponse.metadata,
          messageId: responseMessage.id,
          responseToMessageId: messageId,
        },
      });

      // Stop thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: false, messageId },
      });
    } catch (error) {
      this.logger.error(`Error processing message ${messageId}:`, error);

      // Stop thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: false, messageId },
      });

      // Send error response
      this.sendMessage(client, {
        type: 'error',
        content: 'Sorry, I encountered an error processing your message.',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          messageId,
        },
      });
    }
  }

  private sendMessage(
    client: ExtendedWebSocket,
    message: WebSocketMessage,
  ): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          metadata: {
            ...message.metadata,
            timestamp: new Date().toISOString(),
          },
        };
        client.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        this.logger.error('Error sending message:', error);
      }
    }
  }

  // Public methods for external use
  sendToSession(sessionId: string, message: WebSocketMessage): void {
    let sentCount = 0;
    for (const [, wsSession] of this.sessions.entries()) {
      if (wsSession.sessionId === sessionId) {
        this.sendMessage(wsSession.socket, message);
        sentCount++;
      }
    }
    this.logger.debug(
      `Sent message to ${sentCount} connections for session ${sessionId}`,
    );
  }

  sendToConnection(connectionId: string, message: WebSocketMessage): void {
    const wsSession = this.sessions.get(connectionId);
    if (wsSession) {
      this.sendMessage(wsSession.socket, message);
    } else {
      this.logger.warn(`Connection ${connectionId} not found`);
    }
  }

  sendAgentResponse(sessionId: string, response: AgentResponse): void {
    this.sendToSession(sessionId, {
      type: 'agent_response',
      content: response.content,
      metadata: response.metadata,
    });
  }

  sendAgentThinking(sessionId: string, thinking: boolean): void {
    this.sendToSession(sessionId, {
      type: 'agent_thinking',
      content: '',
      metadata: { thinking },
    });
  }

  sendToolCall(sessionId: string, toolName: string, toolData: unknown): void {
    this.sendToSession(sessionId, {
      type: 'tool_call',
      content: '',
      metadata: {
        tool: toolName,
        data: toolData,
      },
    });
  }

  // Health check and cleanup with improved ping/pong
  private startHealthCheck(): void {
    // Clean up inactive sessions every minute
    this.healthCheckInterval = setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes
      let cleanedCount = 0;

      for (const [connectionId, wsSession] of this.sessions.entries()) {
        if (now.getTime() - wsSession.lastActivity.getTime() > timeout) {
          this.logger.log(`Cleaning up inactive session: ${connectionId}`);
          wsSession.socket.close(4001, 'Session timeout');
          this.sessions.delete(connectionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.log(
          `Cleaned up ${cleanedCount} inactive sessions. Active sessions: ${this.sessions.size}`,
        );
      }
    }, 60000); // Check every minute

    // Send ping to all connections every 30 seconds
    this.pingInterval = setInterval(() => {
      this.pingAllConnections();
    }, 30000);
  }

  private pingAllConnections(): void {
    const deadConnections: string[] = [];

    for (const [connectionId, wsSession] of this.sessions.entries()) {
      if (wsSession.socket.readyState === WebSocket.OPEN) {
        if (wsSession.socket.isAlive === false) {
          // Connection didn't respond to previous ping
          this.logger.log(
            `Terminating unresponsive connection: ${connectionId}`,
          );
          wsSession.socket.terminate();
          deadConnections.push(connectionId);
        } else {
          // Mark as potentially dead and send ping
          wsSession.socket.isAlive = false;
          wsSession.socket.ping();
        }
      } else {
        deadConnections.push(connectionId);
      }
    }

    // Clean up dead connections
    deadConnections.forEach((connectionId) => {
      this.sessions.delete(connectionId);
    });

    if (deadConnections.length > 0) {
      this.logger.log(
        `Removed ${deadConnections.length} dead connections. Active sessions: ${this.sessions.size}`,
      );
    }
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  onModuleInit() {
    this.initializeWebSocketServer();
    this.startHealthCheck();
    this.logger.log('Chat Gateway initialized successfully');
  }

  onModuleDestroy() {
    this.logger.log('Shutting down Chat Gateway...');
    this.stopHealthCheck();

    // Close all connections gracefully
    for (const [, wsSession] of this.sessions.entries()) {
      wsSession.socket.close(1001, 'Server shutting down');
    }

    if (this.server) {
      this.server.close(() => {
        this.logger.log('WebSocket server closed');
      });
    }
  }

  private initializeWebSocketServer() {
    const port = 3002;
    this.server = new WebSocket.Server({
      port,
      path: '/ws',
      perMessageDeflate: false,
      clientTracking: false, // We handle tracking ourselves
    });

    this.server.on('connection', (client: ExtendedWebSocket, request) => {
      void this.handleConnection(client, { url: request.url || '' });
    });

    this.server.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });

    this.server.on('close', () => {
      this.logger.log('WebSocket server closed');
    });

    this.logger.log(
      `WebSocket server initialized on port ${port} with path /ws`,
    );
  }

  // Management methods
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  getSessionInfo(connectionId: string): WebSocketSession | undefined {
    return this.sessions.get(connectionId);
  }

  getSessionsBySessionId(sessionId: string): WebSocketSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.sessionId === sessionId,
    );
  }

  getAllActiveSessions(): WebSocketSession[] {
    return Array.from(this.sessions.values());
  }

  getConnectionStats() {
    const sessions = Array.from(this.sessions.values());
    const now = new Date();

    return {
      totalConnections: sessions.length,
      uniqueSessions: new Set(sessions.map((s) => s.sessionId)).size,
      connectionsByStatus: {
        open: sessions.filter((s) => s.socket.readyState === WebSocket.OPEN)
          .length,
        connecting: sessions.filter(
          (s) => s.socket.readyState === WebSocket.CONNECTING,
        ).length,
        closing: sessions.filter(
          (s) => s.socket.readyState === WebSocket.CLOSING,
        ).length,
        closed: sessions.filter((s) => s.socket.readyState === WebSocket.CLOSED)
          .length,
      },
      averageConnectionTime:
        sessions.length > 0
          ? sessions.reduce(
              (sum, s) => sum + (now.getTime() - s.connectedAt.getTime()),
              0,
            ) / sessions.length
          : 0,
      oldestConnection:
        sessions.length > 0
          ? Math.min(...sessions.map((s) => s.connectedAt.getTime()))
          : null,
    };
  }

  // Method to broadcast to all connections
  broadcast(message: WebSocketMessage, excludeConnectionIds?: string[]): void {
    let sentCount = 0;
    const excludeSet = new Set(excludeConnectionIds || []);

    for (const [connectionId, wsSession] of this.sessions.entries()) {
      if (!excludeSet.has(connectionId)) {
        this.sendMessage(wsSession.socket, message);
        sentCount++;
      }
    }

    this.logger.debug(`Broadcast message sent to ${sentCount} connections`);
  }

  // Force disconnect a specific connection
  disconnectConnection(
    connectionId: string,
    reason: string = 'Forced disconnect',
  ): boolean {
    const wsSession = this.sessions.get(connectionId);
    if (wsSession) {
      wsSession.socket.close(4002, reason);
      this.sessions.delete(connectionId);
      this.logger.log(`Force disconnected: ${connectionId} - ${reason}`);
      return true;
    }
    return false;
  }

  // Force disconnect all connections for a session
  disconnectSession(
    sessionId: string,
    reason: string = 'Session terminated',
  ): number {
    let disconnectedCount = 0;
    const connectionsToDisconnect = Array.from(this.sessions.entries()).filter(
      ([, wsSession]) => wsSession.sessionId === sessionId,
    );

    connectionsToDisconnect.forEach(([connectionId, wsSession]) => {
      wsSession.socket.close(4003, reason);
      this.sessions.delete(connectionId);
      disconnectedCount++;
    });

    if (disconnectedCount > 0) {
      this.logger.log(
        `Disconnected ${disconnectedCount} connections for session ${sessionId} - ${reason}`,
      );
    }

    return disconnectedCount;
  }
}
