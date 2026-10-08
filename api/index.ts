import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../server/app.module';
import express, { Express, Request, Response } from 'express';

const server: Express = express();
let isReady = false;

async function bootstrap() {
  if (!isReady) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: true,
      credentials: true
    });
    await app.init();
    isReady = true;
  }
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  server(req, res);
}
