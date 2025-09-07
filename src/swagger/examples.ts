// src/swagger/examples.ts
import { SurfSpotDto } from 'shakaapi/src/surfspot/dtos/surfspot.dto';
import { CreateSurfSpotDto } from 'shakaapi/src/surfspot/dtos/create-surfspot.dto';
import { ErrorResponseDto } from 'shakaapi/src/swagger/error-response.dto';

/** Single surf spot example (typed -> compile-time safety) */
export const SURFSPOT_EXAMPLE: SurfSpotDto = {
  surfSpotId: 1,
  destination: 'Pipeline',
  address: 'Ehukai Beach Park, Pupukea, HI',
  stateCountry: 'Hawaii, USA',
  difficultyLevel: 5,
  peakSeasonBegin: '2025-11-01',
  peakSeasonEnd: '2026-02-28',
  magicSeaweedLink:
    'https://magicseaweed.com/Oahu-North-Shore-Surf-Report/3841/',
  createdTime: '2025-09-07T12:00:00.000Z',
  geocodeRaw: '{"lat":21.665,"lng":-158.051}',
  photoUrls: [
    'https://example.com/pipeline-1.jpg',
    'https://example.com/pipeline-2.jpg',
  ],
  breakTypes: ['Point Break', 'Reef Break'],
  influencers: ['Gerry Lopez'],
};

/** Arrays & payloads (also typed) */
export const SURFSPOT_LIST_EXAMPLE: SurfSpotDto[] = [SURFSPOT_EXAMPLE];

export const CREATE_SURFSPOT_BODY_EXAMPLE: CreateSurfSpotDto = {
  destination: 'J-Bay',
  address: 'Jeffreys Bay, Eastern Cape',
  stateCountry: 'South Africa',
  difficultyLevel: 4,
  peakSeasonBegin: '2025-06-01',
  peakSeasonEnd: '2025-09-30',
  magicSeaweedLink: 'https://magicseaweed.com/Jeffreys-Bay-Surf-Report/94/',
  createdTime: '2025-07-01T10:00:00.000Z',
  geocodeRaw: '{"lat":-34.05,"lng":24.92}',
};

export const ERROR_404_EXAMPLE: ErrorResponseDto = {
  statusCode: 404,
  message: 'Not Found',
  error: 'Not Found',
};
