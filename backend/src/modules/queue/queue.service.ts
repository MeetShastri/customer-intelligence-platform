import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { URL } from 'url';

@Injectable()
export class QueueService implements OnModuleDestroy {

  private workflowQueue: Queue;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    let redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      const match = redisUrl.match(/(rediss?:\/\/[^\s]+)/);
      if (match) {
        redisUrl = match[1];
      }
    }

    let connectionOptions: any;

    if (redisUrl) {
      const parsed = new URL(redisUrl);
      const isSecure = redisUrl.startsWith('rediss://') || redisUrl.includes('upstash');
      connectionOptions = {
        host: parsed.hostname,
        port: Number(parsed.port) || 6379,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        tls: isSecure ? { rejectUnauthorized: false } : undefined,
      };
    } else {
      connectionOptions = {
        host: redisHost,
        port: redisPort,
      };
    }

    this.workflowQueue = new Queue(
      'workflow-queue',
      {
        connection: connectionOptions,
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

  async getJobStatus(jobId: string): Promise<string | null> {
    try {
      const job = await this.workflowQueue.getJob(jobId);
      if (!job) return null;
      return await job.getState();
    } catch (error) {
      console.error(`Error getting status for job ${jobId}:`, error);
      return null;
    }
  }

  async onModuleDestroy() {
    if (this.workflowQueue) {
      await this.workflowQueue.close();
    }
  }
}