import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('user_message')
  async handleUserMessage(
    @MessageBody() message: { text: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { text, messageId } = message;

    try {
      const stream = this.chatService.streamResponse(text);

      for await (const chunk of stream) {
        client.emit('ai_message_chunk', { messageId, chunk });
      }

      client.emit('ai_message_done', { messageId });
    } catch (err) {
      console.error('Streaming failed', err);
      client.emit('ai_message_error', {
        messageId,
        error: 'Failed to get response from AI.',
      });
    }
  }
}
