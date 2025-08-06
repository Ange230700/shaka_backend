// src\surfspot\dto\update-surfspot.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateSurfSpotDto } from './create-surfspot.dto';

export class UpdateSurfSpotDto extends PartialType(CreateSurfSpotDto) {}
