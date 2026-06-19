import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Explicitly force worker to start in this process
  process.env.START_WORKER = 'true';

  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('NestJS standalone application context initialized.');
  console.log('BullMQ Workflow Worker is running...');

  app.enableShutdownHooks();
}

bootstrap().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});