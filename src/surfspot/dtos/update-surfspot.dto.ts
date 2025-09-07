// src\surfspot\dtos\update-surfspot.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateSurfSpotDto } from 'shakaapi/src/surfspot/dtos/create-surfspot.dto';

export class UpdateSurfSpotDto extends PartialType(CreateSurfSpotDto) {}
