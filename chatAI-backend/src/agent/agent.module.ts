import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [McpModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
