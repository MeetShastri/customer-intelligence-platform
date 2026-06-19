import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import axios from 'axios';
import Redis from 'ioredis';

@Injectable()
export class WorkflowWorker implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;
  private publisher: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const startWorker = this.configService.get<string>('START_WORKER') !== 'false';
    if (!startWorker) {
      console.log('WorkflowWorker is disabled via START_WORKER config.');
      return;
    }

    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';

    this.publisher = new Redis({
      host: redisHost,
      port: redisPort,
    });

    console.log(`Starting WorkflowWorker (Redis: ${redisHost}:${redisPort}, AI: ${aiServiceUrl})...`);

    this.worker = new Worker(
      'workflow-queue',
      async (job) => {
        console.log('Processing job:', job.id);

        const emitProgress = async (step: string, progress: number, logs: string[], result?: any) => {
          await this.publisher.publish(
            'workflow-progress',
            JSON.stringify({
              jobId: job.id,
              step,
              progress,
              logs,
              result,
            }),
          );
        };

        try {
          await emitProgress('starting', 10, ['Workflow started', 'Calling AI service...']);

          const response = await axios.post(
            `${aiServiceUrl}/api/v1/run-workflow/stream`,
            {
              ticket: job.data.ticket,
            },
            {
              responseType: 'stream',
            },
          );

          return new Promise<any>((resolve, reject) => {
            const stream = response.data;
            let buffer = '';
            let currentLogs: string[] = ['Workflow started', 'Calling AI service...'];

            stream.on('data', async (chunk: Buffer) => {
              buffer += chunk.toString();
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const event = JSON.parse(line);

                  if (event.classify_agent) {
                    const data = event.classify_agent;
                    currentLogs = [...currentLogs, ...data.logs];
                    await emitProgress('classification', 35, currentLogs, { urgency: data.urgency });
                  } else if (event.retrieval_agent) {
                    const data = event.retrieval_agent;
                    currentLogs = [...currentLogs, ...data.logs];
                    await emitProgress('retrieval', 60, currentLogs, { retrieved_context: data.retrieved_context });
                  } else if (event.draft_agent) {
                    const data = event.draft_agent;
                    currentLogs = [...currentLogs, ...data.logs];
                    await emitProgress('drafting', 80, currentLogs, { draft_reply: data.draft_reply });
                  } else if (event.supervisor_agent) {
                    const data = event.supervisor_agent;
                    currentLogs = [...currentLogs, ...data.logs];
                    await emitProgress('completed', 100, currentLogs, {
                      urgency: data.urgency,
                      retrieved_context: data.retrieved_context,
                      draft_reply: data.draft_reply,
                      decision: data.decision,
                      logs: currentLogs,
                    });
                    resolve({
                      ticket: job.data.ticket,
                      urgency: data.urgency,
                      retrieved_context: data.retrieved_context,
                      draft_reply: data.draft_reply,
                      decision: data.decision,
                      logs: currentLogs,
                    });
                  }
                } catch (e) {
                  console.error('Error parsing streaming line:', e);
                }
              }
            });

            stream.on('error', (err) => {
              reject(err);
            });

            stream.on('end', () => {
              resolve({ status: 'completed' });
            });
          });

        } catch (error) {
          const errMsg = error.response?.data || error.message;
          console.error('Error processing job in worker:', errMsg);
          await emitProgress('failed', 100, [`Error occurred: ${errMsg}`]);
          throw error;
        }
      },
      {
        connection: {
          host: redisHost,
          port: redisPort,
        },
      },
    );
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.publisher) {
      await this.publisher.quit();
    }
  }
}