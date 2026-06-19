import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {

  private workflowQueue: Queue;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;

    this.workflowQueue = new Queue(
      'workflow-queue',
      {
        connection: {
          host: redisHost,
          port: redisPort,
        },
      },
    );
  }

  async addWorkflowJob(ticket: string) {

    return await this.workflowQueue.add(
      'run-workflow',
      {
        ticket,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }
}