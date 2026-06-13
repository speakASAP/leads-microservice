import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const publicDir = join(process.cwd(), 'public');

  app.useStaticAssets(publicDir, { index: false });
  const server = app.getHttpAdapter().getInstance();
  server.get('/', (_req, res) => res.sendFile(join(publicDir, 'index.html')));
  server.get('/admin', (_req, res) => res.sendFile(join(publicDir, 'admin.html')));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  // Handle comma-separated origins
  const corsOrigins = corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin;
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.setGlobalPrefix('api', { exclude: ['health'] });

  const port = Number(process.env.PORT) || 4400;
  await app.listen(port);
}

bootstrap();
