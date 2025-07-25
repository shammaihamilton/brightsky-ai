import { Injectable, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface MessageProcessingData {
  sessionId: string;
  messageId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface ToolExecutionData {
  sessionId: string;
  toolName: string;
  toolParams: Record<string, any>;
  context: Record<string, any>;
}

@Injectable()
export class QueueService {
  constructor(
    @Optional() @InjectQueue('agent-processing') private agentQueue?: Queue,
    @Optional() @InjectQueue('tool-execution') private toolQueue?: Queue,
  ) {}

  async addAgentProcessingJob(data: MessageProcessingData): Promise<void> {
    if (!this.agentQueue) {
      // Process immediately if no queue available
      console.log('No Redis queue available, processing immediately:', data);
      return;
    }

    await this.agentQueue.add('process-message', data, {
      priority: 10,
      attempts: 3,
      backoff: { type: 'exponential' },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async addToolExecutionJob(data: ToolExecutionData): Promise<void> {
    if (!this.toolQueue) {
      // Process immediately if no queue available
      console.log('No Redis queue available, processing immediately:', data);
      return;
    }

    await this.toolQueue.add('execute-tool', data, {
      priority: 5,
      attempts: 2,
      backoff: { type: 'exponential' },
      removeOnComplete: 50,
      removeOnFail: 25,
    });
  }

  async getAgentQueueStats() {
    return {
      waiting: await this.agentQueue.getWaiting(),
      active: await this.agentQueue.getActive(),
      completed: await this.agentQueue.getCompleted(),
      failed: await this.agentQueue.getFailed(),
    };
  }

  async getToolQueueStats() {
    return {
      waiting: await this.toolQueue.getWaiting(),
      active: await this.toolQueue.getActive(),
      completed: await this.toolQueue.getCompleted(),
      failed: await this.toolQueue.getFailed(),
    };
  }
}
