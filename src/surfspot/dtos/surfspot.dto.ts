// src\surfspot\dtos\surfspot.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class SurfSpotDto {
  @ApiProperty()
  surfSpotId: number;

  @ApiProperty()
  destination: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: false })
  stateCountry?: string | null;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  difficultyLevel?: number | null;

  @ApiProperty({ required: false, type: String, format: 'date' })
  peakSeasonBegin?: string | null;

  @ApiProperty({ required: false, type: String, format: 'date' })
  peakSeasonEnd?: string | null;

  @ApiProperty({ required: false })
  magicSeaweedLink?: string | null;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  createdTime?: string | null;

  @ApiProperty({ required: false })
  geocodeRaw?: string | null;

  // Enriched fields
  @ApiProperty({ type: [String] })
  photoUrls: string[];

  @ApiProperty({ type: [String] })
  breakTypes: string[];

  @ApiProperty({ type: [String] })
  influencers: string[];
}
