// test/setup-e2e.ts
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
    dotenv.config({ path: p }); // default: do NOT override existing env
    break;
  }
}

// Ensure NODE_ENV=test for predictable app behavior
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';
