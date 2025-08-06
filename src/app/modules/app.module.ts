// src\app.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from 'shakaapi/src/prisma/modules/prisma.module';
import { SurfSpotModule } from 'shakaapi/src/surfspot/modules/surfspot.module';
import { AppController } from 'shakaapi/src/app/controllers/app.controller';
import { AppService } from 'shakaapi/src/app/services/app.service';

@Module({
  imports: [PrismaModule, SurfSpotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
