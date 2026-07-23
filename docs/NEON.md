Neon (serverless Postgres) quickstart — Cookbook Next
=====================================================

This project uses Neon (serverless Postgres) as the primary database, accessed through Prisma via the `@prisma/adapter-neon` driver adapter. See [NEON_PRISMA_RUNTIME.md](./NEON_PRISMA_RUNTIME.md) for the runtime client details.

These notes help you configure Prisma and deployment when using Neon/Postgres.

Prerequisites
-------------
- A Neon project and a Postgres database created in Neon (https://neon.tech)
- `pnpm` and `prisma` available in your dev environment

Environment variables
---------------------
Add the Neon connection string(s) to your environment. Example env vars (in Vercel or local `.env.local`):

```env
# Pooled Neon Postgres connection, used by the runtime Prisma client
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"

# Direct (non-pooled) Neon connection, used only for Prisma migrations
# Falls back to DATABASE_URL if not set (see prisma.config.ts)
DIRECT_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

`.env.example` documents `DATABASE_URL` as the required variable; `DIRECT_URL` is optional locally but recommended in Vercel/CI so migrations use a non-pooled connection.

Prisma configuration
--------------------
`prisma/schema.prisma` declares the datasource without an inline `url`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
}

// ...rest of your schema
```

The connection URL is instead resolved by [prisma.config.ts](../prisma.config.ts), which is used by the Prisma CLI (`migrate`, `studio`, etc.):

```ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
```

The application runtime does **not** use `prisma.config.ts` — it builds its own `PrismaClient` with the Neon adapter directly from `DATABASE_URL` (see [src/lib/prisma/prisma.ts](../src/lib/prisma/prisma.ts) and [NEON_PRISMA_RUNTIME.md](./NEON_PRISMA_RUNTIME.md)).

Migrations & deploy
-------------------
- Locally, use `pnpm prisma migrate dev` to create migrations.
- On CI / production, run `pnpm prisma migrate deploy` to apply migrations (this is the exact step used in `.github/workflows/deploy.yml`).

Vercel / CI notes
-----------------
- Add `DATABASE_URL` (and ideally `DIRECT_URL`) as secrets in your Vercel project and in the GitHub repository secrets.
- The `deploy-production` job in `.github/workflows/deploy.yml` runs `pnpm prisma migrate deploy` with `DIRECT_URL` from `secrets.DIRECT_URL` before building/deploying. It falls back to `DATABASE_URL` when the separate secret is not configured and retries transient Neon lock timeouts.
- Example GitHub Actions step for applying migrations (already used in this repo):

```yaml
- name: Run Prisma Migrate Deploy
  run: pnpm prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    DIRECT_URL: ${{ secrets.DIRECT_URL || secrets.DATABASE_URL }}
```

Notes & caveats
---------------
- Neon is serverless-first; cold starts and connection management differ from a traditional Postgres instance. The runtime client uses a small, conservative Neon `Pool` (`max: 10`, `maxUses: 1`) tuned for serverless — see [NEON_PRISMA_RUNTIME.md](./NEON_PRISMA_RUNTIME.md).
- Prisma migrations should use `DIRECT_URL` (non-pooled) rather than the pooled `DATABASE_URL` to avoid issues with DDL statements over a connection pooler.
- If Neon credentials are rotated (e.g. after a password reset in the Neon Dashboard), update `DATABASE_URL`/`DIRECT_URL` in **both** local `.env.local` and the Vercel/GitHub Actions secrets — a local-only update will leave production failing with 500s on every DB-backed request.

