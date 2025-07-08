import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
@Module({
  exports: [ChatService],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
