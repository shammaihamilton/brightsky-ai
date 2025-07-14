import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

interface ChatRequest {
  message: string;
  history: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  timestamp: Date;
}

interface WebSocketMessage {
  type: 'chat' | 'tool' | 'status' | 'error';
  data: any;
  id?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(private readonly agentService: AgentService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send welcome message
    client.emit('message', {
      type: 'status',
      data: {
        message: 'Connected to AI Assistant',
        timestamp: new Date(),
      },
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('chat')
  async handleChatMessage(
    @MessageBody() data: ChatRequest,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      this.logger.log(`Received message from ${client.id}: ${data.message}`);

      // Send typing indicator
      client.emit('message', {
        type: 'status',
        data: {
          message: 'AI is thinking...',
          isTyping: true,
        },
      });

      // Process message through agent
      const response = await this.agentService.processMessage(
        data.message,
        data.history,
        'openai', // default provider
      );

      // Send response back to client
      client.emit('message', {
        type: 'chat',
        data: {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          toolsUsed: response.toolsUsed,
          metadata: response.metadata,
        },
      });

      // Stop typing indicator
      client.emit('message', {
        type: 'status',
        data: {
          isTyping: false,
        },
      });
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);

      client.emit('message', {
        type: 'error',
        data: {
          message: 'Sorry, I encountered an error processing your request.',
          error: error.message,
        },
      });
    }
  }

  @SubscribeMessage('getTools')
  async handleGetTools(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const tools = await this.agentService.getAvailableTools();

      client.emit('message', {
        type: 'tool',
        data: {
          tools,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error getting tools: ${error.message}`);

      client.emit('message', {
        type: 'error',
        data: {
          message: 'Failed to get available tools',
          error: error.message,
        },
      });
    }
  }

  // Broadcast to all connected clients
  broadcastMessage(message: WebSocketMessage): void {
    this.connectedClients.forEach((client) => {
      client.emit('message', message);
    });
  }

  // Send to specific client
  sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit('message', message);
    }
  }
}
