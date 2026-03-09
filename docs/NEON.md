Neon (serverless Postgres) quickstart — Cookbook Next
=====================================================

This project now uses Neon (serverless Postgres) as the primary database. The `@neondatabase/serverless` package is included in `package.json` as an example integration.

These notes help you configure Prisma and deployment when using Neon/Postgres.

Prerequisites
-------------
- A Neon project and a Postgres database created in Neon (https://neon.tech)
- `pnpm` and `prisma` available in your dev environment

Environment variables
---------------------
Add the Neon connection string to your environment. Example env vars (in Vercel or local `.env`):

```env
# Neon Postgres connection (recommended to store in VERCEL/Secrets)
NEON_DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

# If you need to mirror another env var, set `DATABASE_URL` to the same value
DATABASE_URL=${NEON_DATABASE_URL}
```

Prisma configuration
--------------------
Update your `schema.prisma` provider to `postgresql` and use the `env()` variable:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ...rest of your schema
```

Migrations & deploy
-------------------
- Locally, use `pnpm prisma migrate dev` to create migrations.
- On CI / production, run `npx prisma migrate deploy` to apply migrations.

Vercel / CI notes
-----------------
- Add `NEON_DATABASE_URL` (or `DATABASE_URL`) as a secret in your Vercel project.
- Ensure the GitHub Actions job that runs migrations has `DATABASE_URL` set from secrets.
- Example GitHub Actions step for applying migrations (already used in this repo):

```yaml
- name: Run Prisma Migrate Deploy
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

Using `@neondatabase/serverless`
-------------------------------
If you prefer the Neon serverless client, you can use `@neondatabase/serverless` on the server side. Example (simple client wrapper):

```ts
import { createPool } from '@neondatabase/serverless';

const pool = createPool(process.env.DATABASE_URL!);

export async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } finally {
    client.release();
  }
}
```

Notes & caveats
---------------
- Neon is serverless-first; cold starts and connection management differ from a traditional Postgres instance. Use Neon docs for advanced tuning.
- Prisma works with Neon, but you should validate connection settings and pooling strategy for your specific workload.
- This repo's default DB is Neon/Postgres; legacy MongoDB-specific code or docs may remain in the repository and could require updates when migrating.

Need help?
----------
If you want, I can:
- Add a `prisma/schema.prisma` example file for Postgres
- Scaffold a simple `neon/` example showing how to use `@neondatabase/serverless` with one endpoint

Tell me which one you'd like next and I will create it.
