import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SessionModule } from '../session/session.module';
import { AgentModule } from '../agent/agent.module';

@Module({
  imports: [SessionModule, AgentModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
