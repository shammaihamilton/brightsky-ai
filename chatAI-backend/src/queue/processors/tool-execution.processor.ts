import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { ToolExecutionData } from '../queue.service';

@Injectable()
@Processor('tool-execution')
export class ToolExecutionProcessor {
  private readonly logger = new Logger(ToolExecutionProcessor.name);

  @Process('execute-tool')
  async executeTool(job: Job<ToolExecutionData>): Promise<void> {
    const { sessionId, toolName, toolParams, context } = job.data;

    try {
      this.logger.log(`Executing tool ${toolName} for session ${sessionId}`);

      // Simulate async tool execution
      await this.performToolExecution(toolName, toolParams, context);

      this.logger.log(`Tool ${toolName} executed successfully`);
    } catch (error) {
      this.logger.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  private async performToolExecution(
    toolName: string,
    toolParams: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<void> {
    // Mock implementation - replace with actual tool execution logic
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.debug(`Tool execution details:`, {
      toolName,
      params: toolParams,
      context,
    });
  }
}
