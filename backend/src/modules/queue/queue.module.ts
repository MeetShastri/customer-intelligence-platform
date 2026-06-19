import { Module } from '@nestjs/common';

import { QueueService } from './queue.service';
import { WorkflowWorker } from './workflow.worker';

@Module({
  providers: [
    QueueService,
    WorkflowWorker,
  ],
  exports: [
    QueueService,
  ],
})
export class QueueModule {}