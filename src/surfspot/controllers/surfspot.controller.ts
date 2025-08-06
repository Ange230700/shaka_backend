// src\surfspot\controllers\surfspot.controller.ts

import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { SurfSpotService } from 'shakaapi/src/surfspot/services/surfspot.service';
import { SurfSpotDto } from 'shakaapi/src/surfspot/dtos/surfspot.dto';

@Controller('surfspot')
export class SurfSpotController {
  constructor(private readonly surfSpotService: SurfSpotService) {}

  @Get('all')
  async getAll(): Promise<SurfSpotDto[]> {
    return this.surfSpotService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SurfSpotDto> {
    const spot = await this.surfSpotService.findById(Number(id));
    if (!spot) throw new NotFoundException();
    return spot;
  }
}
