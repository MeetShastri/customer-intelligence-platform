import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './modules/socket/socket.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { QueueModule } from './modules/queue/queue.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SocketModule, WorkflowModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
