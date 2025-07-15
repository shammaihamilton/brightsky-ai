import { Module, DynamicModule } from '@nestjs/common';
import { QueueService } from './queue.service';

// Simple mock queue service for when Redis is not available
class MockQueueService {
  addAgentProcessingJob(data: any): Promise<void> {
    console.log(
      '📝 Processing job immediately (no Redis):',
      data?.content || 'job',
    );
    return Promise.resolve();
  }

  addToolExecutionJob(data: any): Promise<void> {
    console.log(
      '🔧 Executing tool immediately (no Redis):',
      data?.toolName || 'tool',
    );
    return Promise.resolve();
  }

  getJobCounts(): Promise<any> {
    return Promise.resolve({ waiting: 0, active: 0, completed: 0, failed: 0 });
  }
}

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    const hasRedis =
      process.env.REDIS_HOST || process.env.NODE_ENV === 'production';

    if (hasRedis) {
      // Import Bull only when Redis is available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { BullModule } = require('@nestjs/bull');

      return {
        module: QueueModule,
        imports: [
          BullModule.registerQueue(
            {
              name: 'agent-processing',
              defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
              },
            },
            {
              name: 'tool-execution',
              defaultJobOptions: {
                removeOnComplete: 50,
                removeOnFail: 25,
              },
            },
          ),
        ],
        providers: [QueueService],
        exports: [QueueService],
      };
    } else {
      // Use mock service when Redis is not available
      console.log('⚠️ Redis not available - using mock queue service');
      return {
        module: QueueModule,
        providers: [
          {
            provide: QueueService,
            useClass: MockQueueService,
          },
        ],
        exports: [QueueService],
      };
    }
  }
}
