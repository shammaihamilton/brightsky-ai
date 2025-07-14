import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('stream')
  streamChat(@Body() body: { prompt: string; useMock?: boolean }) {
    const stream = this.chatService.streamResponse(body.prompt, {
      useMock: body.useMock || false,
    });

    // Return as Server-Sent Events or handle as needed
    return stream;
  }

  @Post('full')
  async fullChat(@Body() body: { prompt: string; useMock?: boolean }) {
    return await this.chatService.fullResponse(body.prompt, {
      useMock: body.useMock || false,
    });
  }
}
