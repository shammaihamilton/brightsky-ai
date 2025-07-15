import { Injectable } from '@nestjs/common';

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
export class SimpleQueueService {
  async addAgentProcessingJob(data: MessageProcessingData): Promise<void> {
    // Process immediately without queue
    console.log('📝 Processing message immediately:', data.content);
    return Promise.resolve();
  }

  async addToolExecutionJob(data: ToolExecutionData): Promise<void> {
    // Execute immediately without queue
    console.log('🔧 Executing tool immediately:', data.toolName);
    return Promise.resolve();
  }

  async getJobCounts(): Promise<any> {
    return Promise.resolve({ waiting: 0, active: 0, completed: 0, failed: 0 });
  }
}
