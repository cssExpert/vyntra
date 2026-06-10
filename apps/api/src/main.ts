import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const express = require('express');

  // Increase payload size limit for file uploads (images as data URLs)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Register static file serving for media assets AFTER cors but BEFORE global prefix
  app.use('/medias', express.static(path.join(process.cwd(), 'public', 'medias'), {
    etag: false,
    maxAge: 0,
  }));

  app.setGlobalPrefix('api');

  // Validate + strip unknown properties on every DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API running at http://localhost:${port}/api`);
}

bootstrap();
