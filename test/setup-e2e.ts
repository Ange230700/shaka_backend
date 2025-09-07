// test/setup-e2e.ts
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load dedicated test env (works locally and in CI)
config({ path: resolve(process.cwd(), '.env.test') });
