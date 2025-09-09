<!-- README.md -->

# Shaka API — Surf spots catalog (NestJS + Prisma/MySQL)

Shaka API is a production-ready NestJS service that exposes a catalog of surf spots with enriched details (photos, break types, influencers). It ships with strict validation, OpenAPI docs, security headers, rate limiting (memory or Redis), structured logging (Pino), end-to-end tests against a real MySQL instance, and CI that applies the Prisma schema (from the shared `shakadb` package), seeds test data, and runs unit/E2E suites.

## Tech stack (high level)

* **Runtime/Framework**: Node 24, NestJS 11 (Express)
* **DB layer**: Prisma Client from the shared package **`shakadb`** (MySQL 8.x)
* **Validation / Docs**: class-validator, class-transformer, Swagger (OpenAPI)
* **Security**: Helmet, CORS allowlist, global rate-limit (Redis optional)
* **Logging**: `nestjs-pino` (Pino, pretty logs in dev, redact sensitive fields)
* **Testing**: Jest (unit), Supertest (E2E) with disposable MySQL & typed env validation (Zod)
* **DevEx**: TS strictness, path aliases (`shakaapi/*`), Husky + lint-staged, commitlint/commitizen
* **Packaging/Runtime**: Dockerfile (builder/runner), docker-compose for local dev
* **CI**: GitHub Actions pipeline (build, lint, unit, E2E) + MySQL service + schema/seed steps

## Main features

* **SurfSpot endpoints**

  * `GET /surfspot/all` – list spots enriched with `photoUrls`, `breakTypes`, `influencers`
  * `GET /surfspot/:id` – fetch one enriched spot (404 when missing)
  * `POST /surfspot` – create a spot (validated payload, safe date handling)
* **Health check**: `GET /healthz`
* **API docs**: Swagger at `/docs`, with typed examples and response schemas
* **Hardening**

  * Helmet (CSP relaxed in dev for Swagger), CORS allowlist via `FRONT_API_BASE_URL`
  * Global rate-limit (skip `/healthz` and `/docs`); Redis store supported
  * Request ID propagation (`X-Request-Id`) and structured logs with redaction

---

## Quick start

```bash
# 1) Install
npm ci

# 2) Provide env (see .env.sample)
cp .env.sample .env
# Set DATABASE_URL for MySQL + optionally FRONT_API_BASE_URL, rate-limit, Redis, LOG_LEVEL

# 3) Run in dev (hot-reload)
npm run start:dev
# Swagger UI at http://localhost:3000/docs
```

### Using Docker (dev)

```bash
docker compose up --build
# app runs on 3000 (mapped by compose)
```

---

## Testing (unit + E2E with real MySQL)

* **Schema application**: the API uses the Prisma schema shipped by `shakadb`.

* **Seed**: `scripts/seed-test-db.ts` inserts a minimal, consistent dataset (Pipeline spot + relations).

* **E2E convenience**:

  ```bash
  # spin up a disposable local MySQL for E2E (port 3307)
  npm run e2e:db:up
  # seed test data into DATABASE_URL declared in .env.test*
  npm run e2e:db:seed
  # run E2E tests
  npm run test:e2e
  # tear down the container
  npm run e2e:db:down
  ```

* **One-liners**

  ```bash
  npm test           # unit tests
  npm run test:e2e   # end-to-end tests
  npm run test:cov   # coverage
  ```

> CI mirrors the above: it boots a MySQL 8.4 service, applies `shakadb`’s schema via `prisma db push`, seeds, builds, lints, and runs both test suites.

---

## Configuration

All envs are validated with **Zod** (`src/config/env.schema.ts`). Key variables:

* `PORT` (default 3000)
* `FRONT_API_BASE_URL` – comma-separated origins for CORS allowlist
* `DATABASE_URL` – MySQL DSN (required; used by `shakadb`/Prisma)
* `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`
* `RATE_LIMIT_STORE` = `memory` | `redis` (with `REDIS_URL` when `redis`)
* `LOG_LEVEL` (e.g., `debug` in dev, `info` in prod)

---

## API surface (summary)

* **`POST /surfspot`**
  Validated body (`CreateSurfSpotDto`): destination, address, optional metadata (stateCountry, difficultyLevel \[1..5], `peakSeasonBegin/End` as ISO dates, `magicSeaweedLink`, `createdTime`, `geocodeRaw`). Returns a normalized DTO (dates ISO strings) with empty enrichment arrays on create.

* **`GET /surfspot/all`**
  Returns a list of `SurfSpotDto`, each enriched with `photoUrls`, `breakTypes`, `influencers`.

* **`GET /surfspot/:id`**
  Returns one `SurfSpotDto` or 404.

* **`GET /healthz`**
  `{ ok: true, ts: <ISO> }`

All endpoints are documented and exampled in **Swagger** (`/docs`).

---

## Internals & structure

* **Modules**: `AppModule`, `SurfSpotModule`, `PrismaModule`
* **Service**: `SurfSpotService` maps raw Prisma results → `SurfSpotEntity` → `SurfSpotDto`, and bulk-enriches related data with efficient `findMany` joins
* **Logging**: `nestjs-pino` with request ID generation, pretty logs in dev, redaction of secrets, 4xx/5xx log levels
* **Security**: Helmet, strict CORS with allowlist, global ValidationPipe (`whitelist`, `forbidNonWhitelisted`, `transform`)
* **DX**: TS strictness (`noImplicitAny`, `strictNullChecks`, etc.), path alias `shakaapi/*`, Prettier, ESLint flat config, commit hooks (format+lint, branch name rules)

---

## NPM scripts (highlights)

* **Dev/Build**: `start`, `start:dev`, `build`
* **Test**: `test`, `test:watch`, `test:e2e`, `test:cov`
* **E2E DB helpers**: `e2e:db:up`, `e2e:db:seed`, `e2e:db:down`
* **Quality**: `lint`, `format`
* **Convenience**: `clean`, `commit` (commitizen)

---

## Deployment

* **Docker**: multi-stage build (`node:24-alpine`), production runner executes `node dist/src/main.js`
* **CSP note**: CSP is disabled in dev for Swagger; in prod Helmet enables safe defaults (with exceptions so `/docs` continues to work)
* **Rate limiting**: Defaults to memory; switch to Redis via `RATE_LIMIT_STORE=redis` and `REDIS_URL` in prod
* **Reverse proxy**: App trusts proxy (for correct client IPs in rate-limit) — configure your ingress (NGINX/Traefik) accordingly
