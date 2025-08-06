// test\surfspot.e2e-spec.ts

import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from 'shakaapi/src/app/modules/app.module';
import { SurfSpotDto } from 'shakaapi/src/surfspot/dtos/surfspot.dto';

describe('SurfSpotController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/surfspot/all (GET)', () => {
    it('should return an array of surf spots with all fields', async () => {
      const res: Response = await request(app.getHttpServer())
        .get('/surfspot/all')
        .expect(200);

      const spots: SurfSpotDto[] = res.body as SurfSpotDto[];
      expect(Array.isArray(spots)).toBe(true);

      // If there's at least one surfspot, validate shape
      if (spots.length > 0) {
        const spot = spots[0];
        expect(spot).toHaveProperty('surfSpotId');
        expect(spot).toHaveProperty('destination');
        expect(spot).toHaveProperty('address');
        expect(spot).toHaveProperty('photoUrls');
        expect(Array.isArray(spot.photoUrls)).toBe(true);
        expect(spot).toHaveProperty('breakTypes');
        expect(Array.isArray(spot.breakTypes)).toBe(true);
        expect(spot).toHaveProperty('influencers');
        expect(Array.isArray(spot.influencers)).toBe(true);
      }
    });
  });

  describe('/surfspot/:id (GET)', () => {
    it('should return a single surf spot by id', async () => {
      // First, get all spots to pick a valid id
      const allRes = await request(app.getHttpServer()).get('/surfspot/all');
      const spots: SurfSpotDto[] = allRes.body as SurfSpotDto[];
      const firstSpot = spots[0];
      if (!firstSpot) return;
      const id = firstSpot.surfSpotId;

      const res = await request(app.getHttpServer())
        .get(`/surfspot/${id}`)
        .expect(200);

      const spot: SurfSpotDto = res.body as SurfSpotDto;

      expect(spot).toHaveProperty('surfSpotId', id);
      expect(spot).toHaveProperty('destination', firstSpot.destination);
      expect(Array.isArray(spot.photoUrls)).toBe(true);
      expect(Array.isArray(spot.breakTypes)).toBe(true);
      expect(Array.isArray(spot.influencers)).toBe(true);
    });

    it('should return 404 for an unknown surf spot', async () => {
      await request(app.getHttpServer())
        .get('/surfspot/99999999') // unlikely id
        .expect(404);
    });
  });
});
