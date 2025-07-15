import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({})
export class NoOpQueueModule {
  static register(): DynamicModule {
    return {
      module: NoOpQueueModule,
      providers: [
        {
          provide: 'QueueService',
          useValue: {
            addAgentProcessingJob: async (data: any) => {
              console.log('📝 Queue processing (no Redis):', data);
            },
            addToolExecutionJob: async (data: any) => {
              console.log('🔧 Tool execution (no Redis):', data);
            },
            getJobCounts: async () => ({ waiting: 0, active: 0, completed: 0, failed: 0 }),
          },
        },
      ],
      exports: ['QueueService'],
    };
  }
}
