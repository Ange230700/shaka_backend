// src/config/app-config.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from 'shakaapi/src/config/env.schema'; // Zod path

@Injectable()
export class AppConfigService {
  constructor(private readonly cfg: ConfigService<Env, true>) {}
  port() {
    return this.cfg.get('PORT', { infer: true });
  }
  allowlist() {
    return this.cfg
      .get('FRONT_API_BASE_URL', { infer: true })
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
