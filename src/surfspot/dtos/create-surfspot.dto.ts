// src\surfspot\dto\create-surfspot.dto.ts

import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateSurfSpotDto {
  @IsString()
  destination: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  stateCountry?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @IsOptional()
  @IsDateString()
  peakSeasonBegin?: string;

  @IsOptional()
  @IsDateString()
  peakSeasonEnd?: string;

  @IsOptional()
  @IsUrl()
  magicSeaweedLink?: string;

  @IsOptional()
  @IsDateString()
  createdTime?: string;

  @IsOptional()
  @IsString()
  geocodeRaw?: string;
}
