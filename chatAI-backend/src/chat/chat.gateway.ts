import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AgentService } from '../agent/agent.service';
import * as WebSocket from 'ws';
import * as url from 'url';

// Extend WebSocket to include connectionId
interface ExtendedWebSocket extends WebSocket {
  connectionId?: string;
}

export interface WebSocketSession {
  sessionId: string;
  userId?: string;
  connectedAt: Date;
  lastActivity: Date;
  socket: ExtendedWebSocket;
  connectionId: string;
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
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: WebSocket.Server;

  private readonly logger = new Logger(ChatGateway.name);
  private sessions = new Map<string, WebSocketSession>();

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
      };

      this.sessions.set(connectionId, wsSession);

      // Store connection ID on the client for cleanup
      client.connectionId = connectionId;

      this.logger.log(
        `Client connected: ${connectionId} (Session: ${sessionId})`,
      );

      // Send session info
      this.sendMessage(client, {
        type: 'session_connected',
        content: '',
        metadata: {
          sessionId,
          conversationHistory: session.conversationHistory,
          preferences: session.preferences,
        },
      });

      // Set up message handler
      client.on('message', (data: WebSocket.Data) => {
        void this.handleMessage(client, data, wsSession);
      });

      // Update last activity on ping
      client.on('pong', () => {
        wsSession.lastActivity = new Date();
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
          `Client disconnected: ${connectionId} (Session: ${wsSession.sessionId})`,
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
      const dataString = Buffer.isBuffer(data)
        ? data.toString()
        : typeof data === 'string'
          ? data
          : Array.isArray(data)
            ? Buffer.concat(data).toString()
            : JSON.stringify(data);

      const message = JSON.parse(dataString) as ParsedMessage;

      this.logger.log(
        `Processing message from session ${wsSession.sessionId}:`,
        message,
      );

      // Update last activity
      wsSession.lastActivity = new Date();

      // Handle different message types
      if (message.content) {
        await this.processUserMessage(
          client,
          message as UserMessageDto,
          wsSession,
        );
      } else if (message.type === 'ping') {
        // Handle ping messages
        this.sendMessage(client, {
          type: 'pong',
          content: '',
          metadata: {},
        });
      } else {
        this.logger.warn('Unknown message format:', message);
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

  private async processUserMessage(
    client: ExtendedWebSocket,
    messageData: UserMessageDto,
    wsSession: WebSocketSession,
  ): Promise<void> {
    try {
      // Save user message to session
      const userMessage = {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content: messageData.content,
        timestamp: new Date(),
        metadata: messageData.metadata || {},
      };

      await this.sessionService.addMessage(wsSession.sessionId, userMessage);

      // Send thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: true },
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
        messageData.metadata || {},
      );

      // Save agent response to session
      const responseMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant' as const,
        content: agentResponse.content,
        timestamp: new Date(),
        metadata: agentResponse.metadata || {},
      };

      await this.sessionService.addMessage(
        wsSession.sessionId,
        responseMessage,
      );

      // Send response to client
      this.sendMessage(client, {
        type: 'agent_response',
        content: agentResponse.content,
        metadata: agentResponse.metadata || {},
      });

      // Stop thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: false },
      });
    } catch (error) {
      this.logger.error('Error processing message:', error);

      // Stop thinking status
      this.sendMessage(client, {
        type: 'agent_thinking',
        content: '',
        metadata: { thinking: false },
      });

      // Send error response
      this.sendMessage(client, {
        type: 'error',
        content: 'Sorry, I encountered an error processing your message.',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
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
        client.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error('Error sending message:', error);
      }
    }
  }

  // Public methods for external use
  sendToSession(sessionId: string, message: WebSocketMessage): void {
    for (const [, wsSession] of this.sessions.entries()) {
      if (wsSession.sessionId === sessionId) {
        this.sendMessage(wsSession.socket, message);
      }
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

  // Health check and cleanup
  startHealthCheck(): void {
    setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes

      for (const [connectionId, wsSession] of this.sessions.entries()) {
        if (now.getTime() - wsSession.lastActivity.getTime() > timeout) {
          this.logger.log(`Cleaning up inactive session: ${connectionId}`);
          wsSession.socket.close(4001, 'Session timeout');
          this.sessions.delete(connectionId);
        }
      }
    }, 60000); // Check every minute
  }

  onModuleInit() {
    this.initializeWebSocketServer();
    this.startHealthCheck();
  }

  private initializeWebSocketServer() {
    const port = 3002;
    this.server = new WebSocket.Server({
      port,
      path: '/ws',
      perMessageDeflate: false,
    });

    this.server.on('connection', (client: ExtendedWebSocket, request) => {
      void this.handleConnection(client, { url: request.url || '' });
    });

    this.server.on('error', (error) => {
      this.logger.error('WebSocket server error:', error);
    });

    this.logger.log(
      `WebSocket server initialized on port ${port} with path /ws`,
    );
  }

  // Method to get active sessions count
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  // Method to get session info
  getSessionInfo(connectionId: string): WebSocketSession | undefined {
    return this.sessions.get(connectionId);
  }
}
