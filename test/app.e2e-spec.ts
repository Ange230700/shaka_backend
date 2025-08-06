// test\app.e2e-spec.ts

import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from 'shakaapi/src/app/modules/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const res: Response = await request(app.getHttpServer()).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});
