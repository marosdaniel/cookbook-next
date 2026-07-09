# Neon + Prisma runtime notes

## Runtime configuration

- The application uses Prisma with the Neon serverless adapter in Node.js serverless runtime.
- The runtime Prisma client must use the pooled `DATABASE_URL`.
- `DIRECT_URL` is reserved for migrations and should not be used by the runtime client.

## Current implementation

- Prisma is initialized in [src/lib/prisma/prisma.ts](../src/lib/prisma/prisma.ts).
- The runtime client uses a Neon `Pool` via `@neondatabase/serverless` and `@prisma/adapter-neon`.
- The pool is configured with a small conservative limit for serverless usage:
  - `max: 10`
  - `maxUses: 1`
- A simple shutdown hook calls `pool.end()` on process exit to avoid lingering connections.

## Why this shape

- The GraphQL route may issue multiple Prisma queries per request, so reusing pooled connections is preferable to one HTTP fetch per query.
- This is aligned with Node.js serverless runtime, not Edge runtime.

## Environment variables

- `DATABASE_URL`: pooled Neon connection string for runtime queries.
- `DIRECT_URL`: direct Neon connection string for Prisma migrations. Used by `prisma.config.ts` (CLI only), falling back to `DATABASE_URL` if unset. Not used by the runtime client in [src/lib/prisma/prisma.ts](../src/lib/prisma/prisma.ts).
