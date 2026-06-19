import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [HttpModule, QueueModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule { }
