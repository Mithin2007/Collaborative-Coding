# Invenzo AI

AI Capacity Exchange + EC Settlement Network + Vibe Coding Studio.

This repository contains:

- **Frontend** (`src/`): the approved React 19 + Vite 8 + Tailwind 4 prototype. It runs entirely on in-memory **demo data** and keeps working with no backend.
- **Backend** (`server/`): Milestone 1 — the API and database *foundation*. It adds infrastructure only; it does not yet power any screen.

> **Status: Milestone 1 (backend foundation).** The UI still labels backend-dependent behaviour as Demo / Simulated / Illustrative / Pending backend. Those labels are intentional and must stay until the matching backend milestone ships.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | **22.x** | pinned in `.mise.toml` and `server/package.json` (`engines`) |
| pnpm | **10.x** | `.mise.toml` pins 10.34.3 |
| PostgreSQL | **16** | via Docker (recommended) *or* any instance you run yourself |
| Docker | optional | only a convenience for local PostgreSQL; the app never requires it |

`mise install` (reads `.mise.toml`) gives you the right Node and pnpm.

## Quick start

```bash
pnpm install                        # installs frontend + server (pnpm workspace)

cp .env.example .env                # then edit: replace the placeholder password
pnpm db:up                          # start PostgreSQL 16 in Docker (optional, see below)

pnpm db:generate                    # generate the Prisma client
pnpm db:migrate:deploy              # apply migrations to DATABASE_URL

pnpm server:dev                     # API on http://127.0.0.1:4000
pnpm dev                            # frontend (Vite) on http://localhost:8443
```

Verify the backend:

```bash
curl -i http://127.0.0.1:4000/api/health
# 200 {"status":"ok","service":"invenzo-api","environment":"development","database":"connected",...}
# 503 {"status":"degraded",...,"database":"unavailable",...}   when PostgreSQL is down
```

### Demo mode vs backend connected

The frontend never calls the backend unless `VITE_API_BASE_URL` is set (e.g. `VITE_API_BASE_URL=http://localhost:4000` in `.env`). Unset = **demo mode**: every screen works exactly as before, with no PostgreSQL and no API running. `src/lib/api/` is only a client foundation (`apiRequest`, `getBackendStatus()`); no screen uses it yet, and it never reports success it did not observe.

## PostgreSQL setup

**Docker (recommended):** `pnpm db:up` starts `postgres:16` from `docker-compose.yml` on `127.0.0.1:${POSTGRES_PORT:-5432}` with a persistent volume, and creates a second database, `invenzo_test`, for the test suite. Credentials come from your git-ignored `.env`. `pnpm db:down` stops it (data is kept in the volume).

**Your own PostgreSQL:** skip Docker. Create two databases (e.g. `invenzo` and `invenzo_test`) and point `DATABASE_URL` / `TEST_DATABASE_URL` at them. The role needs `CREATEDB` (Prisma uses a shadow database for `migrate dev`; the migration test creates a scratch database).

The application depends **only on `DATABASE_URL`**.

## Environment variables

Copy `.env.example` to `.env` (git-ignored — never commit it).

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | API, Prisma CLI | — (required) | PostgreSQL connection URL |
| `TEST_DATABASE_URL` | DB tests | — | **Disposable** database; reset on every test run. Must differ from `DATABASE_URL` |
| `NODE_ENV` | API | `development` | `development` \| `test` \| `production` |
| `API_HOST` | API | `127.0.0.1` | Bind address |
| `API_PORT` | API | `4000` | Bind port |
| `LOG_LEVEL` | API | `info` | `fatal`…`trace`, `silent` |
| `CORS_ORIGINS` | API | `http://localhost:8443` | Comma-separated allowed browser origins |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | docker-compose | — | Local Docker database only |
| `VITE_API_BASE_URL` | Frontend | unset (demo) | API base URL. **Anything `VITE_*` is public in the browser bundle — never put secrets there.** |

The API validates its environment at boot (Zod) and exits with a message naming the bad variable — never its value.

## Commands

All from the repo root:

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` | Frontend dev server / production build |
| `pnpm typecheck` | Type-check the frontend |
| `pnpm server:dev` | API with auto-reload (tsx watch) |
| `pnpm server:build` / `pnpm server:start` | Compile to `server/dist` / run compiled API |
| `pnpm server:typecheck` | Type-check the server |
| `pnpm db:validate` | `prisma validate` |
| `pnpm db:generate` | `prisma generate` |
| `pnpm db:migrate` | `prisma migrate dev` — **development**: create/apply migrations (add `--name <name>`) |
| `pnpm db:migrate:deploy` | `prisma migrate deploy` — **CI / deployment**: apply committed migrations only |
| `pnpm db:status` | `prisma migrate status` |
| `pnpm test` | All backend tests (unit + DB) |
| `pnpm --filter @invenzo/server test:unit` | Unit tests only (no database needed) |
| `pnpm --filter @invenzo/server test:db` | DB tests only (needs `TEST_DATABASE_URL`) |

### Migrations policy

Schema changes go through **migrations only**: edit `server/prisma/schema.prisma`, run `pnpm db:migrate -- --name <what_changed>`, commit the generated folder. **Never use `prisma db push`** as the schema strategy. Deployments and CI use `migrate deploy`.

| Migration | Contents |
| --- | --- |
| `*_init` | Prisma-generated: enums, 20 tables, indexes, foreign keys |
| `*_integrity_constraints` | **Hand-written** (Prisma cannot express these): CHECK constraints and append-only triggers. Fully commented — read it before changing ledger tables |

Prisma does not see CHECK constraints or triggers when diffing, so keep them in hand-written migrations created with `prisma migrate dev --create-only`.

### Tests

- **Unit** (`server/test/unit`): environment validation, public IDs, error envelope, health endpoint, logging redaction, credential-vault boundary, provider-integration contracts. No database required.
- **DB** (`server/test/db`): Prisma connection, user repository, audit append-only protection, wallet idempotency/arithmetic, capacity CHECK constraints, pricing (exact USD storage)/usage constraints, and migration correctness (a scratch database is migrated from empty, checked for drift against `schema.prisma`, then dropped).
- DB tests **fail loudly** with instructions if PostgreSQL is unreachable — they are never skipped. Each run **resets** `TEST_DATABASE_URL` (and refuses to run if it equals `DATABASE_URL`).

## Architecture

```
React/Vite frontend (demo data; optional API client)
        │  HTTP (CORS-restricted)
        ▼
Fastify 5 ── routes ─▶ controllers ─▶ services ─▶ repositories ─▶ Prisma ─▶ PostgreSQL
```

```
server/
├── prisma/            schema.prisma + migrations/
├── src/
│   ├── server.ts      process entry: env, listen, graceful shutdown
│   ├── app.ts         buildApp(): wiring only (no listen) — used by tests via inject()
│   ├── config/        Zod-validated environment
│   ├── routes/        route registry (routes/index.ts) — one line per future module
│   ├── controllers/   HTTP in/out only
│   ├── services/      business logic (+ credentials/ vault *interface*)
│   ├── repositories/  the ONLY layer that touches Prisma
│   ├── middleware/    request id + access log, central error handler
│   ├── contracts/     provider-integration contract (types + Zod schema only)
│   ├── lib/           prisma client, logger, public ids, errors, validation
│   └── types/         API DTOs (never expose internal ids)
└── test/              unit/ and db/
```

**Why Fastify (not Express):** structured Pino logging and per-request IDs are built in; async errors reach one `setErrorHandler`; `app.inject()` makes route tests fast with no open port; plugin encapsulation suits modules added over several milestones.

**Conventions**

- **Errors:** always `{ "error": { "code", "message", "requestId" } }` (validation errors add `details`). Unexpected errors return a generic 500; stack traces and internals are never sent to clients.
- **Validation:** Zod at the API boundary (`lib/validation.ts`). Frontend validation is UX; backend validation is the security boundary.
- **Logging:** one JSON line per request — `requestId`, `method`, `path` (no query string), `status`, `durationMs`. Bodies are never logged; `authorization`, `cookie`, `x-api-key` (and similar) are redacted.
- **IDs:** every table has an internal `BigInt id` that never leaves the server, and a unique, indexed `publicId` (`usr_…`, `wtx_…`, …; 128 bits of CSPRNG entropy).
- **Secrets:** nothing secret is stored raw. `ProviderConnection.encryptedCredentialRef` is an opaque vault reference; `DeveloperApiKey.secretHash` is a hash; the vault itself is an interface that throws `NOT_IMPLEMENTED` until Milestone 2.

## Database architecture (20 models)

| Area | Models |
| --- | --- |
| Identity | `User` |
| Providers | `ProviderConnection`, `ProviderAccount`, `ProviderModel` |
| **Provider Capacity Ledger** | `CapacityAccount`, `CapacitySnapshot`, `CapacityContribution`, `CapacityReservation` |
| **EC Wallet Ledger** | `Wallet`, `WalletTransaction` |
| Pricing | `PricingVersion`, `PricingRate` |
| Exchange | `ExchangeOffer`, `ExchangeAgreement`, `Entitlement` |
| Metering | `UsageRecord` |
| Platform | `AuditEvent`, `Project`, `Notification`, `DeveloperApiKey` |

### Why the Provider Capacity Ledger and the EC Wallet Ledger are separate

- **Provider capacity** is *non-fungible*: 1M Gemini tokens are not 1M Claude tokens, and a model, provider account and expiry all matter. It is stored as integer (`BigInt`) tokens per provider account + exact model, with `committed`, `reserved`, `consumed` (and derived `remaining = committed − reserved − consumed`). A CHECK constraint guarantees `reserved + consumed ≤ committed`. There is deliberately **no generic token balance** anywhere.
- **EC** is a single *internal accounting unit* (`Decimal(20,6)`), not money and not tokens. The wallet is an append-only transaction history with `balanceBefore`/`balanceAfter`, a per-wallet unique **idempotency key**, a reference entity and metadata; DB CHECKs enforce the arithmetic and a non-negative balance.
- Merging them would hide *which provider/model* a claim is against and invite unverified conversions. They connect only through explicit records: agreements → entitlements → usage records priced by a **versioned** pricing table.

### Ledger safety

- `WalletTransaction` and `AuditEvent` are **append-only**: PostgreSQL triggers reject `UPDATE`, `DELETE` and `TRUNCATE`; their repositories expose no mutation methods.
- Future balance changes **must** run inside one DB transaction: `SELECT … FOR UPDATE` the wallet row → insert the transaction (unique idempotency key) → update the cached balance. Never "read, subtract, write" without that protection. `server/test/db/wallet.test.ts` shows the pattern and proves racing duplicates cannot both succeed.
- Note: triggers stop application bugs and ordinary roles. A superuser can still disable them; tamper-evidence (hash chaining) is a later milestone.

### Pricing

Pricing is data, not code, and the **provider's real USD price is stored separately from EC**:

- `PricingVersion` — label, `source`, `effectiveFrom` / `effectiveTo`, status. The version is authoritative for which rates apply and when.
- `PricingRate` — one row per exact model + usage type (`INPUT` / `CACHED_INPUT` / `OUTPUT`) + tier, holding `usdPerMillionTokens` (`Decimal(20,8)`, exact — never floating point). It deliberately has **no EC column**.

Future flow (not implemented yet — the schema and contracts only make it possible):

```
actual provider usage → provider USD cost (PricingRate) → EC conversion → EC cost (UsageRecord.ecCost)
```

`UsageRecord` keeps `providerCostUsd`, `ecCost` and `pricingVersionId` so every charge is reproducible. **Milestone 1 ships no price data**, and nothing in the product should claim pricing is current until a sourced version is loaded.

## Provider-integration contract (types only)

`server/src/contracts/` defines the boundary between the future provider layer and the rest of the platform. **No provider is implemented.**

```
ProviderAdapter ──▶ NormalizedUsage ──▶ Usage Service ──▶ Pricing Engine
```

| File | Contents |
| --- | --- |
| `provider.ts` | `ProviderId`, `ProviderAdapter` (`verifyConnection`, `generate`), normalized request/response, `ProviderAdapterError` kinds |
| `usage.ts` | `NormalizedUsage` + Zod `normalizedUsageSchema`, `PricingEngine` (`computeProviderCost` → `convertToEc`), `UsageRecorder` |
| `entities.ts` | Read views: `UserView`, `ProviderConnectionView`, `ProviderModelView`, `EntitlementView`, `UsageRecordView`, `PricingVersionView`, `AuditEventView`, `ProjectView` — public ids only, no credential material |
| `lookups.ts` | Lookup ports (`findByPublicId`, `ProviderModelLookup.findByKey`, `PricingVersionLookup.findEffectiveAt`, …) and the append-only `AuditEventAppender` |

`NormalizedUsage` carries `provider`, `model` (exact key), `requestId`, `inputTokens`, `cachedInputTokens`, `outputTokens`, `totalTokens`. **Counting convention** (adapters must normalize to it, because each bucket is priced separately): `inputTokens` excludes cached tokens, reasoning/thinking tokens count as output, and `totalTokens = input + cached + output` (enforced by the schema). `requestId` is the platform's id and is the idempotency key of the resulting `UsageRecord`.

## Milestone 1 limitations (intentionally deferred)

No real authentication, sessions, MFA or password handling · no credential vault implementation · no provider adapters (Gemini / Claude / OpenAI) · no capacity verification · no EC mutation services, exchange matching or settlement · no Studio execution · no API-key authentication · no notification delivery · no audit hash-chaining · no pricing data or pricing/EC-conversion service · no provider implementations (contracts only) · no Redis / queues · no production deployment config. Existing screens still use demo data.

## Next: Milestone 2

Authentication and sessions, the credential vault (envelope encryption), and the provider-adapter interface — see the implementation report for details.
