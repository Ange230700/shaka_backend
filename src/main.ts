// src\main.ts

import type { ReqId } from 'pino-http';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { AppModule } from 'shakaapi/src/app/modules/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

export type RequestWithId = Request & { id?: ReqId };

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useLogger(app.get(Logger));
  // Optionally expose X-Request-Id on responses:
  app.use((req: RequestWithId, res: Response, next: NextFunction) => {
    const rid = req.id;
    if (typeof rid === 'string' || typeof rid === 'number') {
      res.setHeader('X-Request-Id', String(rid));
    }
    // if it's some other shape, skip exposing it
    next();
  });
  const config = app.get(ConfigService);
  const isProd =
    config.get<'development' | 'test' | 'production'>(
      'NODE_ENV',
      'development',
    ) === 'production';
  // If behind a proxy (NGINX/Traefik/Heroku/Render), trust it so rate-limit sees real IPs
  app.set('trust proxy', 1);
  app.enableVersioning({ type: VersioningType.URI });
  const allowlist = (config.get<string>('FRONT_API_BASE_URL', '') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowlist.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);
  // Helmet
  // In prod: enable most defaults. In dev: disable CSP so Swagger UI works without extra headers.
  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
            useDefaults: true,
            directives: {
              // If you host Swagger UI at /docs, keep it working:
              'script-src': ["'self'", "'unsafe-inline'"], // allow inline for Swagger’s bundle
              'img-src': ["'self'", 'data:', 'blob:'],
            },
          }
        : false, // simpler for dev
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images/fonts from CDNs
      referrerPolicy: { policy: 'no-referrer' },
      // Other defaults: dnsPrefetchControl, frameguard, hsts (set by default in helmet on https)
    }),
  );
  // Global rate limit (sane default)
  // You can tighten window/max in prod via envs
  const WINDOW_MS = config.get<number>('RATE_LIMIT_WINDOW_MS', 60_000); // 1m
  const MAX = config.get<number>('RATE_LIMIT_MAX', isProd ? 100 : 1000); // 100 req/min in prod
  const useRedis =
    config.get<'memory' | 'redis'>('RATE_LIMIT_STORE') === 'redis';
  const redisUrl = config.get<string>('REDIS_URL');
  let store: InstanceType<typeof RedisStore> | undefined;
  if (useRedis && redisUrl) {
    try {
      const client = createClient({ url: redisUrl });
      client.on('error', (e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(
          '⚠️  Redis client error (rate-limit will use memory store):',
          msg,
        );
      });
      await client.connect();

      // rate-limit-redis expects a sendCommand function
      store = new RedisStore({
        sendCommand: (...args: string[]) =>
          client.sendCommand(args as readonly string[]),
      });

      console.log('✅ Rate limit store: Redis');
    } catch (e) {
      console.warn(
        '⚠️  Failed to init Redis rate-limit store. Falling back to memory.',
        e,
      );
      store = undefined;
    }
  } else {
    console.log('ℹ️  Rate limit store: memory (single-process only)');
  }
  app.use(
    rateLimit({
      windowMs: WINDOW_MS,
      max: MAX,
      standardHeaders: true, // RateLimit-* headers
      legacyHeaders: false, // X-RateLimit-* headers
      store,
      skip: (req: Request) =>
        // Allow health checks and optionally Swagger/docs to be skipped:
        req.path === '/healthz' || req.path.startsWith('/docs'),
      message: { error: 'Too many requests, please try again later.' },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unexpected props
      forbidNonWhitelisted: true, // error on extra props
      transform: true, // auto-convert payloads (e.g. dates & numbers)
    }),
  );
  const swaggerCfg = new DocumentBuilder()
    .setTitle('Shaka API')
    .setDescription('Shaka API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('surf-spots', 'Surf spots catalog & details')
    .addTag('health', 'Liveness & readiness')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup('docs', app, document);
  await app.listen(config.get<number>('PORT', 3000));
}
bootstrap().catch((err: unknown) => {
  const msg =
    err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err);
  console.error('💥 Bootstrap error:', msg);
  process.exit(1);
});
