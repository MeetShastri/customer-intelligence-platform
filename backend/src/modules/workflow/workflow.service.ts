import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common'; 
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class WorkflowService {  

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly queueService: QueueService,

  ) {}

  async runWorkflow(ticket: string) {

  const job =
    await this.queueService
      .addWorkflowJob(ticket);

  return {
    message:
      'Workflow queued',
    jobId: job.id,
  };
}

  async getJobStatus(jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

}