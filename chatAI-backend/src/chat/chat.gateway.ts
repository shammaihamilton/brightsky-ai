import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import { AgentService } from '../agent/agent.service';

export interface WebSocketSession {
  sessionId: string;
  userId?: string;
  connectedAt: Date;
  lastActivity: Date;
  socket: Socket;
}

export interface UserMessageDto {
  content: string;
  metadata?: Record<string, any>;
}

export interface AgentResponseDto {
  type: 'agent_thinking' | 'tool_call' | 'agent_response' | 'error';
  content: string;
  metadata?: Record<string, any>;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'chrome-extension://*',
    ],
    credentials: true,
  },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private sessions = new Map<string, WebSocketSession>();

  constructor(
    private readonly sessionService: SessionService,
    private readonly agentService: AgentService,
  ) {}

  async handleConnection(client: Socket) {
    const sessionId = client.handshake.query.sessionId as string;

    if (!sessionId) {
      this.logger.error('Connection rejected: No session ID provided');
      client.disconnect();
      return;
    }

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
      };

      this.sessions.set(client.id, wsSession);

      // Join session room
      await client.join(sessionId);

      this.logger.log(`Client connected: ${client.id} (Session: ${sessionId})`);

      // Send session info
      client.emit('session_connected', {
        sessionId,
        conversationHistory: session.conversationHistory,
        preferences: session.preferences,
      });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const wsSession = this.sessions.get(client.id);
    if (wsSession) {
      this.sessions.delete(client.id);
      this.logger.log(
        `Client disconnected: ${client.id} (Session: ${wsSession.sessionId})`,
      );
    }
  }

  @SubscribeMessage('user_message')
  async handleUserMessage(
    @MessageBody() data: UserMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const wsSession = this.sessions.get(client.id);
    if (!wsSession) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      // Save user message to session
      const userMessage = {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content: data.content,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      await this.sessionService.addMessage(wsSession.sessionId, userMessage);

      // Process message directly with agent
      try {
        // Send thinking status
        client.emit('agent_thinking', { thinking: true });

        // Get session for context
        const session = await this.sessionService.getSession(
          wsSession.sessionId,
        );
        if (!session) {
          throw new Error('Session not found');
        }

        // Process with agent
        const agentResponse = await this.agentService.processMessage(
          data.content,
          session.conversationHistory,
          session.context,
          data.metadata,
        );

        // Save agent response to session
        const responseMessage = {
          id: `msg_${Date.now()}_response`,
          role: 'assistant' as const,
          content: agentResponse.content,
          timestamp: new Date(),
          metadata: agentResponse.metadata,
        };

        await this.sessionService.addMessage(
          wsSession.sessionId,
          responseMessage,
        );

        // Send response to client
        client.emit('agent_response', {
          type: 'agent_response',
          content: agentResponse.content,
          metadata: agentResponse.metadata,
        });

        // Stop thinking status
        client.emit('agent_thinking', { thinking: false });
      } catch (processingError) {
        this.logger.error('Error processing message:', processingError);
        client.emit('agent_thinking', { thinking: false });
        client.emit('agent_response', {
          type: 'error',
          content: 'Sorry, I encountered an error processing your message.',
          metadata: {
            error:
              processingError instanceof Error
                ? processingError.message
                : 'Unknown error',
          },
        });
      }
    } catch (error) {
      this.logger.error('Error handling user message:', error);
      client.emit('error', { message: 'Failed to process message' });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: Socket): void {
    const wsSession = this.sessions.get(client.id);
    if (wsSession) {
      client.to(wsSession.sessionId).emit('user_typing', { typing: true });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(@ConnectedSocket() client: Socket): void {
    const wsSession = this.sessions.get(client.id);
    if (wsSession) {
      client.to(wsSession.sessionId).emit('user_typing', { typing: false });
    }
  }

  @SubscribeMessage('get_history')
  async handleGetHistory(@ConnectedSocket() client: Socket) {
    const wsSession = this.sessions.get(client.id);
    if (!wsSession) {
      client.emit('error', { message: 'Session not found' });
      return;
    }

    try {
      const session = await this.sessionService.getSession(wsSession.sessionId);
      if (session) {
        client.emit('conversation_history', {
          history: session.conversationHistory,
          sessionId: wsSession.sessionId,
        });
      }
    } catch (error) {
      this.logger.error('Error getting history:', error);
      client.emit('error', { message: 'Failed to get history' });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string | UserMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Handle both string and object formats
    const messageData: UserMessageDto =
      typeof data === 'string' ? { content: data, metadata: {} } : data;

    return this.handleUserMessage(messageData, client);
  }

  // Method to send messages to specific session
  sendToSession(sessionId: string, event: string, data: any): void {
    this.server.to(sessionId).emit(event, data);
  }

  // Method to send agent response
  sendAgentResponse(sessionId: string, response: AgentResponseDto): void {
    this.sendToSession(sessionId, 'agent_response', response);
  }

  // Method to send agent thinking status
  sendAgentThinking(sessionId: string, thinking: boolean): void {
    this.sendToSession(sessionId, 'agent_thinking', { thinking });
  }

  // Method to send tool call notification
  sendToolCall(sessionId: string, toolName: string, toolData: unknown): void {
    this.sendToSession(sessionId, 'tool_call', {
      tool: toolName,
      data: toolData,
    });
  }
}
