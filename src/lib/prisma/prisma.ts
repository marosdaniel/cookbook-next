import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

import { PrismaClient } from '@prisma/client';

import ws from 'ws';

import { env } from '@/env';
import {
  PRISMA_OPERATION_TIMEOUT_MS,
  prismaTimeoutExtension,
} from './prismaTimeout';

neonConfig.webSocketConstructor = ws;

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const MAX_TRANSACTION_WAIT_MS = 5_000;

const createPrismaClient = () => {
  const connectionString = env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'No database connection string found. Set DATABASE_URL environment variable.',
    );
  }

  const adapter = new PrismaNeon({
    connectionString,
    max: 10,
    maxUses: 1,
    // Sent as a startup parameter, so it only takes effect on direct (non-pooled)
    // connections. Neon's PgBouncer pooler ignores it; the extension below and
    // `transactionOptions` are what protect pooled connections.
    statement_timeout: PRISMA_OPERATION_TIMEOUT_MS,
  });

  const prismaClient = new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: MAX_TRANSACTION_WAIT_MS,
      timeout: PRISMA_OPERATION_TIMEOUT_MS,
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

  return prismaClient.$extends(prismaTimeoutExtension());
};

export type AppPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
