// scripts/seed-test-db.ts
/**
 * Seed a minimal dataset for E2E:
 * - 1 surf spot (Pipeline)
 * - 2 break types (Point Break, Reef Break) with join rows
 * - 1 influencer (Gerry Lopez) with join row
 * - 2 photos
 */
import { PrismaClient } from 'shakadb/prisma/generated/prisma-client';

const prisma = new PrismaClient();

async function main() {
  // Clear in FK-safe order inside a transaction
  await prisma.$transaction([
    prisma.photo.deleteMany(),
    prisma.surfSpot_SurfBreakType.deleteMany(),
    prisma.surfSpot_Influencer.deleteMany(),
    prisma.influencer.deleteMany(),
    prisma.surfBreakType.deleteMany(),
    prisma.surfSpot.deleteMany(),
  ]);

  // Create base spot
  const spot = await prisma.surfSpot.create({
    data: {
      destination: 'Pipeline',
      address: 'Ehukai Beach Park, Pupukea, HI',
      state_country: 'Hawaii, USA',
      difficulty_level: 5,
      peak_season_begin: new Date('2025-11-01'),
      peak_season_end: new Date('2026-02-28'),
      magic_seaweed_link:
        'https://magicseaweed.com/Oahu-North-Shore-Surf-Report/3841/',
      created_time: new Date(),
      geocode_raw: '{"lat":21.665,"lng":-158.051}',
    },
    select: { surf_spot_id: true },
  });

  // Create break types (no createManyAndReturn in Prisma)
  await prisma.surfBreakType.createMany({
    data: [
      { surf_break_type_name: 'Point Break' },
      { surf_break_type_name: 'Reef Break' },
    ],
    skipDuplicates: true,
  });

  // Read them back to get IDs
  const breakTypes = await prisma.surfBreakType.findMany({
    where: { surf_break_type_name: { in: ['Point Break', 'Reef Break'] } },
    select: { surf_break_type_id: true, surf_break_type_name: true },
  });

  // Influencer
  const influencer = await prisma.influencer.create({
    data: { influencer_name: 'Gerry Lopez' },
    select: { influencer_id: true },
  });

  // Photos
  await prisma.photo.createMany({
    data: [
      {
        surf_spot_id: spot.surf_spot_id,
        url: 'https://example.com/pipeline-1.jpg',
      },
      {
        surf_spot_id: spot.surf_spot_id,
        url: 'https://example.com/pipeline-2.jpg',
      },
    ],
  });

  // Join rows (types + influencer)
  await prisma.$transaction([
    ...breakTypes.map((bt) =>
      prisma.surfSpot_SurfBreakType.create({
        data: {
          surf_spot_id: spot.surf_spot_id,
          surf_break_type_id: bt.surf_break_type_id,
        },
      }),
    ),
    prisma.surfSpot_Influencer.create({
      data: {
        surf_spot_id: spot.surf_spot_id,
        influencer_id: influencer.influencer_id,
      },
    }),
  ]);

  console.log('✅ Seeded surf spot:', spot.surf_spot_id);
}

main()
  .catch((err: unknown) => {
    // Properly narrow the unknown error to satisfy @typescript-eslint/no-unsafe-*
    if (err instanceof Error) {
      console.error('❌ Seed failed:', err.message, '\n', err.stack);
    } else {
      console.error('❌ Seed failed with non-Error:', String(err));
    }
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
