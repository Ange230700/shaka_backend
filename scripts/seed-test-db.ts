// scripts/seed-test-db.ts
/**
 * Seed a minimal dataset for E2E:
 * - 1 surf spot (Pipeline)
 * - 2 break types (Point Break, Reef Break) with join rows
 * - 1 influencer (Gerry Lopez) with join row
 * - 2 photos
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const cwd = process.cwd();
const candidates = isCI
  ? ['.env.test.ci', '.env.test', '.env']
  : ['.env.test.local', '.env.test', '.env'];

for (const fname of candidates) {
  const p = path.join(cwd, fname);
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';

if (process.env.NODE_ENV !== 'test') {
  console.error('❌ Refusing to seed because NODE_ENV is not "test".');
  process.exit(1);
}

import prisma from 'shakadb';
import { Prisma } from 'shakadb/generated/prisma-client';

type TableRow = { table_name: string };

async function assertSchemaPresent() {
  // List of tables your seed expects
  const required = [
    'SurfSpot',
    'SurfBreakType',
    'Influencer',
    'Photo',
    'SurfSpot_SurfBreakType',
    'SurfSpot_Influencer',
  ];

  // Which of those are actually present?
  const rows = await prisma.$queryRaw<TableRow[]>(
    Prisma.sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name IN (${Prisma.join(required)})
    `,
  );

  const present = new Set(rows.map((r) => r.table_name));
  const missing = required.filter((t) => !present.has(t));

  if (missing.length) {
    throw new Error(
      `Schema not applied. Missing tables: ${missing.join(
        ', ',
      )}. Run Prisma db push for shakadb before seeding.`,
    );
  }
}

async function resetDb() {
  // Use raw SQL to avoid FK violations; Prisma model names map to PascalCase tables
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0');
  // Truncate children first (order is less important with FK checks off, but this is tidy)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `SurfSpot_SurfBreakType`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `SurfSpot_Influencer`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Photo`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `Influencer`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `SurfBreakType`');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE `SurfSpot`');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1');
}

async function main() {
  // Ensure schema exists (run prisma migrate deploy/push for shakadb before this script)
  await assertSchemaPresent();
  await resetDb();

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

  // Break types
  await prisma.surfBreakType.createMany({
    data: [
      { surf_break_type_name: 'Point Break' },
      { surf_break_type_name: 'Reef Break' },
    ],
    skipDuplicates: true,
  });
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

  // Joins
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
