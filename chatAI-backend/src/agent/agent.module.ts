import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { McpModule } from '../mcp/mcp.module';
import { AIService } from '../services/ai.service';

@Module({
  imports: [McpModule],
  providers: [AgentService, AIService],
  exports: [AgentService],
})
export class AgentModule {}
