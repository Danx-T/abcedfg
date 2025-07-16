import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('ENV TEST:', process.env.DB_HOST, process.env.DB_PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS ayarları - HER DOMAINE AÇIK
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // ConfigService ile PORT bilgisini al
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>('PORT') || '3000', 10);

  await app.listen(port);
  console.log(`✅ Uygulama http://localhost:${port} adresinde çalışıyor`);
}

bootstrap();
