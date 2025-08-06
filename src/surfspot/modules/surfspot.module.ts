// src\surfspot\modules\surfspot.module.ts

import { Module } from '@nestjs/common';
import { SurfSpotService } from 'shakaapi/src/surfspot/services/surfspot.service';
import { SurfSpotController } from 'shakaapi/src/surfspot/controllers/surfspot.controller';
import { PrismaService } from 'shakaapi/src/prisma/services/prisma.service';

@Module({
  controllers: [SurfSpotController],
  providers: [SurfSpotService, PrismaService],
})
export class SurfSpotModule {}
