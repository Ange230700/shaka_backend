// src/app/controllers/health.controller.ts
import { Controller, Get } from '@nestjs/common';
@Controller('healthz')
export class HealthController {
  @Get() ping() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
