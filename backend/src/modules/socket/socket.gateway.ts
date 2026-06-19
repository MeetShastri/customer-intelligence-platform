import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from '@nestjs/websockets';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnModuleInit, OnModuleDestroy {

  @WebSocketServer()
  server: Server;

  private subscriber: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;

    this.subscriber = new Redis({
      host: redisHost,
      port: redisPort,
    });

    this.subscriber.subscribe('workflow-progress');

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'workflow-progress') {
        try {
          const data = JSON.parse(message);
          const { jobId } = data;
          if (jobId) {
            this.server.to(jobId).emit('progress-update', data);
          }
        } catch (error) {
          console.error('Error parsing progress update from Redis:', error);
        }
      }
    });
  }

  onModuleDestroy() {
    if (this.subscriber) {
      this.subscriber.quit();
    }
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, jobId: string) {
    client.join(jobId);
    console.log(`Client ${client.id} joined room: ${jobId}`);
    return { status: 'joined', jobId };
  }
}