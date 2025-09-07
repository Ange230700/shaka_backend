// src\surfspot\dtos\create-surfspot.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurfSpotDto {
  @ApiProperty({ example: 'Pipeline' })
  @IsString()
  destination: string;

  @ApiProperty({ example: 'Ehukai Beach Park, Pupukea, HI' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 'Hawaii, USA' })
  @IsOptional()
  @IsString()
  stateCountry?: string;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @ApiPropertyOptional({ example: '2025-11-01', format: 'date' })
  @IsOptional()
  @IsDateString()
  peakSeasonBegin?: string;

  @ApiPropertyOptional({ example: '2026-02-28', format: 'date' })
  @IsOptional()
  @IsDateString()
  peakSeasonEnd?: string;

  @ApiPropertyOptional({
    example: 'https://magicseaweed.com/Oahu-North-Shore-Surf-Report/3841/',
  })
  @IsOptional()
  @IsUrl()
  magicSeaweedLink?: string;

  @ApiPropertyOptional({
    example: '2025-09-07T12:00:00.000Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  createdTime?: string;

  @ApiPropertyOptional({ example: '{"lat":21.665,"lng":-158.051}' })
  @IsOptional()
  @IsString()
  geocodeRaw?: string;
}
