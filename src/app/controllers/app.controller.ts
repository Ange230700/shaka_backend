// src\app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from 'shakaapi/src/app/services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
