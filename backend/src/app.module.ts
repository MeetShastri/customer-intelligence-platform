import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './modules/socket/socket.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SocketModule, WorkflowModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
