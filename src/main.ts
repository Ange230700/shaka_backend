// src\main.ts

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'shakaapi/src/app/modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unexpected props
      forbidNonWhitelisted: true, // error on extra props
      transform: true, // auto-convert payloads (e.g. dates & numbers)
    }),
  );
  app.enableCors({
    origin: process.env.FRONT_API_BASE_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Shaka API')
    .setDescription('Shaka API description')
    .setVersion('1.0')
    .addTag('shaka')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('💥 Bootstrap error:', err);
  process.exit(1);
});
