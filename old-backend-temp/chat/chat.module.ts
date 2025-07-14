import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from '../controllers/ChatController';
import { DatabaseService } from '../services/database/DatabaseService';

@Module({
  controllers: [ChatController],
  exports: [ChatService, DatabaseService],
  providers: [ChatService, ChatGateway, DatabaseService],
})
export class ChatModule {}
