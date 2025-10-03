/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { AuditInterceptor } from './app/audit.interceptor';
import { seedDev } from './app/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Allow Angular dev server to call the API
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validate/transform all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Simple audit logging
  app.useGlobalInterceptors(new AuditInterceptor());

  const port = Number(process.env.PORT) || 3000;

  // Seed demo data in dev
  if (process.env.NODE_ENV !== 'production') {
    await seedDev(app);
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
