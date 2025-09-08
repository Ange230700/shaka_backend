// src/app/modules/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from 'shakaapi/src/config/env.schema';
import rateLimit from 'express-rate-limit';
import { PrismaModule } from 'shakaapi/src/prisma/modules/prisma.module';
import { SurfSpotModule } from 'shakaapi/src/surfspot/modules/surfspot.module';
import { AppController } from 'shakaapi/src/app/controllers/app.controller';
import { AppService } from 'shakaapi/src/app/services/app.service';
import { randomUUID } from 'node:crypto';
import type {
  IncomingMessage,
  ServerResponse,
  IncomingHttpHeaders,
} from 'node:http';
import type { ReqId } from 'pino-http';

const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      envFilePath:
        process.env.NODE_ENV === 'test' ? ['.env.test', '.env'] : ['.env'],
    }),

    // ⬇️ Logger configured from ConfigService
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd =
          cfg.get<'development' | 'test' | 'production'>(
            'NODE_ENV',
            'development',
          ) === 'production';
        return {
          pinoHttp: {
            level: cfg.get<string>('LOG_LEVEL') ?? (isProd ? 'info' : 'debug'),
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: { singleLine: true, translateTime: 'SYS:standard' },
                },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'headers.authorization',
                '*.password',
                'password',
              ],
              censor: '[REDACTED]',
            },
            genReqId: (req) =>
              (req.headers['x-request-id'] as string | undefined) ??
              randomUUID(),
            customLogLevel: (_req, res, err) => {
              if (err || res.statusCode >= 500) return 'error';
              if (res.statusCode >= 400) return 'warn';
              return 'info';
            },
            autoLogging: {
              ignore: (req: IncomingMessage & { url?: string }) =>
                (req.url ?? '') === '/healthz' ||
                (req.url ?? '').startsWith('/docs'),
            },
            serializers: {
              req(
                req: IncomingMessage & {
                  id?: ReqId;
                  originalUrl?: string;
                  url?: string;
                  headers: IncomingHttpHeaders;
                },
              ) {
                const method = req.method ?? 'GET';
                const url = req.originalUrl ?? req.url ?? '';
                const ua = req.headers['user-agent'] as
                  | string
                  | string[]
                  | undefined;
                const userAgent: string | undefined = Array.isArray(ua)
                  ? ua[0]
                  : ua;

                return {
                  id: (req.id as string | number | undefined) ?? undefined,
                  method,
                  url,
                  userAgent,
                  remoteAddress: req.socket?.remoteAddress,
                };
              },
              res(res: ServerResponse) {
                return { statusCode: res.statusCode };
              },
            },
          },
        };
      },
    }),

    PrismaModule,
    SurfSpotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(authLimiter).forRoutes('/auth/login', '/auth/register');
  }
}
