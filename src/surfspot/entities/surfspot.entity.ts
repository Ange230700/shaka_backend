// src\surfspot\entities\surfspot.entity.ts

export class SurfSpotEntity {
  surfSpotId: number;
  destination: string;
  address: string;
  stateCountry?: string | null;
  difficultyLevel?: number | null;
  peakSeasonBegin?: Date | null;
  peakSeasonEnd?: Date | null;
  magicSeaweedLink?: string | null;
  createdTime?: Date | null;
  geocodeRaw?: string | null;

  // Enriched:
  photoUrls: string[] = [];
  breakTypes: string[] = [];
  influencers: string[] = [];
}
