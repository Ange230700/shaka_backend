// test/setup-e2e.ts
// Ensure E2E uses the test env file
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

const cwd = process.cwd();
const envTest = path.join(cwd, '.env.test');
dotenv.config({
  path: fs.existsSync(envTest) ? envTest : path.join(cwd, '.env'),
});

// Force NODE_ENV=test so ConfigModule, rate limit, etc. behave accordingly
process.env.NODE_ENV = 'test';
