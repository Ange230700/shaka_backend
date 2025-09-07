// src\surfspot\dtos\surfspot.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class SurfSpotDto {
  @ApiProperty({ example: 1 })
  surfSpotId: number;

  @ApiProperty({ example: 'Pipeline' })
  destination: string;

  @ApiProperty({ example: 'Ehukai Beach Park, Pupukea, HI' })
  address: string;

  @ApiProperty({ required: false, nullable: true, example: 'Hawaii, USA' })
  stateCountry?: string | null;

  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 5,
    nullable: true,
    example: 5,
  })
  difficultyLevel?: number | null;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date',
    nullable: true,
    example: '2025-11-01',
  })
  peakSeasonBegin?: string | null;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-02-28',
  })
  peakSeasonEnd?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://magicseaweed.com/Oahu-North-Shore-Surf-Report/3841/',
  })
  magicSeaweedLink?: string | null;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    nullable: true,
    example: '2025-09-07T12:00:00.000Z',
  })
  createdTime?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '{"lat":21.665,"lng":-158.051}',
  })
  geocodeRaw?: string | null;

  // Enriched fields
  @ApiProperty({
    type: [String],
    example: [
      'https://example.com/pipeline-1.jpg',
      'https://example.com/pipeline-2.jpg',
    ],
  })
  photoUrls: string[];

  @ApiProperty({ type: [String], example: ['Point Break', 'Reef Break'] })
  breakTypes: string[];

  @ApiProperty({ type: [String], example: ['Gerry Lopez'] })
  influencers: string[];
}
