import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';

@Module({
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
})
export class QueueModule {}
