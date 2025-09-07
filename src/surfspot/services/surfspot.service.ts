// src\surfspot\services\surfspot.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'shakaapi/src/prisma/services/prisma.service';
import { SurfSpotEntity } from 'shakaapi/src/surfspot/entities/surfspot.entity';
import { SurfSpotDto } from 'shakaapi/src/surfspot/dtos/surfspot.dto';
import { CreateSurfSpotDto } from 'shakaapi/src/surfspot/dtos/create-surfspot.dto';
import { Prisma } from 'shakadb/prisma/generated/prisma-client';

type RawSurfSpot = {
  surf_spot_id: number;
  destination: string;
  address: string;
  state_country?: string | null;
  difficulty_level?: number | null;
  peak_season_begin?: Date | null;
  peak_season_end?: Date | null;
  magic_seaweed_link?: string | null;
  created_time?: Date | null;
  geocode_raw?: string | null;
};

function isPrismaKnownError(
  e: unknown,
): e is Prisma.PrismaClientKnownRequestError {
  return e instanceof Prisma.PrismaClientKnownRequestError;
}

/** Map a raw Prisma surfSpot record to your entity. */
function toSurfSpotEntity(prisma: RawSurfSpot): SurfSpotEntity {
  return {
    surfSpotId: prisma.surf_spot_id,
    destination: prisma.destination,
    address: prisma.address,
    stateCountry: prisma.state_country,
    difficultyLevel: prisma.difficulty_level,
    peakSeasonBegin: prisma.peak_season_begin,
    peakSeasonEnd: prisma.peak_season_end,
    magicSeaweedLink: prisma.magic_seaweed_link,
    createdTime: prisma.created_time,
    geocodeRaw: prisma.geocode_raw,
    photoUrls: [],
    breakTypes: [],
    influencers: [],
  };
}

/** Map a SurfSpotEntity to a SurfSpotDto, handling date serialization. */
function toSurfSpotDto(entity: SurfSpotEntity): SurfSpotDto {
  return {
    surfSpotId: entity.surfSpotId,
    destination: entity.destination,
    address: entity.address,
    stateCountry: entity.stateCountry,
    difficultyLevel: entity.difficultyLevel,
    peakSeasonBegin: entity.peakSeasonBegin
      ? entity.peakSeasonBegin.toISOString().slice(0, 10)
      : null,
    peakSeasonEnd: entity.peakSeasonEnd
      ? entity.peakSeasonEnd.toISOString().slice(0, 10)
      : null,
    magicSeaweedLink: entity.magicSeaweedLink,
    createdTime: entity.createdTime ? entity.createdTime.toISOString() : null,
    geocodeRaw: entity.geocodeRaw,
    photoUrls: entity.photoUrls || [],
    breakTypes: entity.breakTypes || [],
    influencers: entity.influencers || [],
  };
}

@Injectable()
export class SurfSpotService {
  constructor(private readonly prisma: PrismaService) {}

  /** CREATE a surf spot (returns enriched DTO; arrays empty on create) */
  async create(body: CreateSurfSpotDto): Promise<SurfSpotDto> {
    try {
      const created = await this.prisma.surfSpot.create({
        data: {
          destination: body.destination,
          address: body.address,
          state_country: body.stateCountry ?? null,
          difficulty_level: body.difficultyLevel ?? null,
          peak_season_begin: body.peakSeasonBegin
            ? new Date(body.peakSeasonBegin)
            : null,
          peak_season_end: body.peakSeasonEnd
            ? new Date(body.peakSeasonEnd)
            : null,
          magic_seaweed_link: body.magicSeaweedLink ?? null,
          created_time: body.createdTime
            ? new Date(body.createdTime)
            : new Date(),
          geocode_raw: body.geocodeRaw ?? null,
        },
      });

      const entity: SurfSpotEntity = {
        ...toSurfSpotEntity(created),
        photoUrls: [],
        breakTypes: [],
        influencers: [],
      };

      return toSurfSpotDto(entity);
    } catch (err: unknown) {
      const isUnique = isPrismaKnownError(err) && err.code === 'P2002';

      // Let TS infer; shape matches HttpExceptionOptions
      const options =
        err instanceof Error
          ? {
              cause: err,
              description: isUnique ? 'Unique constraint violation' : undefined,
            }
          : undefined;

      throw new BadRequestException(
        isUnique ? 'Surf spot already exists' : 'Unable to create surf spot',
        options,
      );
    }
  }

  // GET ALL with enrichment
  async findAll(): Promise<SurfSpotDto[]> {
    // Load base spots
    const spotsRaw = await this.prisma.surfSpot.findMany();

    if (!spotsRaw.length) return [];

    // Map to entity
    const spots: SurfSpotEntity[] = spotsRaw.map(toSurfSpotEntity);
    const ids = spots.map((s) => s.surfSpotId);

    // Fetch related data in bulk (joins via Prisma)
    const [photos, breakTypes, influencers] = await Promise.all([
      this.prisma.photo.findMany({
        where: { surf_spot_id: { in: ids } },
        select: { surf_spot_id: true, url: true },
      }),
      this.prisma.surfSpot_SurfBreakType.findMany({
        where: { surf_spot_id: { in: ids } },
        include: { SurfBreakType: { select: { surf_break_type_name: true } } },
      }),
      this.prisma.surfSpot_Influencer.findMany({
        where: { surf_spot_id: { in: ids } },
        include: { Influencer: { select: { influencer_name: true } } },
      }),
    ]);

    // Add enrichment to SurfSpotEntity instances
    spots.forEach((spot) => {
      spot.photoUrls = photos
        .filter((p) => p.surf_spot_id === spot.surfSpotId)
        .map((p) => p.url!)
        .filter(Boolean);
      spot.breakTypes = breakTypes
        .filter((bt) => bt.surf_spot_id === spot.surfSpotId)
        .map((bt) => bt.SurfBreakType.surf_break_type_name)
        .filter(Boolean);
      spot.influencers = influencers
        .filter((inf) => inf.surf_spot_id === spot.surfSpotId)
        .map((inf) => inf.Influencer.influencer_name!)
        .filter(Boolean);
    });

    // Merge enrichments into DTOs
    return spots.map(toSurfSpotDto);
  }

  // GET by ID with enrichment
  async findById(id: number): Promise<SurfSpotDto | null> {
    const spotRaw = await this.prisma.surfSpot.findUnique({
      where: { surf_spot_id: id },
    });
    if (!spotRaw) return null;

    const spot: SurfSpotEntity = toSurfSpotEntity(spotRaw);

    // Fetch enrichments
    const [photos, breakTypes, influencers] = await Promise.all([
      this.prisma.photo.findMany({
        where: { surf_spot_id: id },
        select: { url: true },
      }),
      this.prisma.surfSpot_SurfBreakType.findMany({
        where: { surf_spot_id: id },
        include: { SurfBreakType: { select: { surf_break_type_name: true } } },
      }),
      this.prisma.surfSpot_Influencer.findMany({
        where: { surf_spot_id: id },
        include: { Influencer: { select: { influencer_name: true } } },
      }),
    ]);

    spot.photoUrls = photos.map((p) => p.url!).filter(Boolean);
    spot.breakTypes = breakTypes
      .map((bt) => bt.SurfBreakType.surf_break_type_name)
      .filter(Boolean);
    spot.influencers = influencers
      .map((inf) => inf.Influencer.influencer_name!)
      .filter(Boolean);

    return toSurfSpotDto(spot);
  }
}
