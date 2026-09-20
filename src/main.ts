import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Agregar { rawBody: true } requerido para el webhook de Stripe
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // 2. Agregar forbidNonWhitelisted: true exigido en los requisitos técnicos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3003); // Sugerido puerto 3003 en la consigna
}
bootstrap();
