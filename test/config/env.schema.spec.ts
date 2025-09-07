// test/config/env.schema.spec.ts
import { validateEnv } from 'shakaapi/src/config/env.schema';

describe('env validation (zod)', () => {
  it('fails when DATABASE_URL is missing', () => {
    expect(() =>
      validateEnv({ NODE_ENV: 'test', FRONT_API_BASE_URL: '' }),
    ).toThrow(/DATABASE_URL/i);
  });

  it('coerces numbers and applies defaults', () => {
    const env = validateEnv({
      DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
      PORT: '4000',
    });
    expect(env.PORT).toBe(4000);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60000);
  });
});
