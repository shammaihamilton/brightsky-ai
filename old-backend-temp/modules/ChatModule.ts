import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/ChatController';
import { DatabaseService } from '../services/database/DatabaseService';

@Module({
  controllers: [ChatController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class ChatModule {}
