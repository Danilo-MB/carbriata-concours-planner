import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express, { Express, Request, Response } from 'express';

const server: Express = express();
let isReady = false;
let initPromise: Promise<void> | null = null;

async function bootstrap() {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      app.setGlobalPrefix('api');
      app.enableCors({
        origin: true,
        credentials: true
      });
      await app.init();
      isReady = true;
    })();
  }
  await initPromise;
}

async function handler(req: Request, res: Response) {
  try {
    await bootstrap();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    server(req, res);
  } catch (err: any) {
    console.error('NestJS Handler Error:', err);
    res.status(500).json({
      error: 'Server Error',
      message: err?.message || String(err)
    });
  }
}

export default handler;

