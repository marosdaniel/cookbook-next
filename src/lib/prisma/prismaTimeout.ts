import { Prisma } from '@prisma/client';
import { TimeoutStrategy, timeout } from 'cockatiel';

export const PRISMA_OPERATION_TIMEOUT_MS = 10_000;

/**
 * Client extension that rejects any Prisma operation (model queries and raw
 * queries, also inside interactive transactions) that doesn't settle in time.
 *
 * This is an application-side guard only: it does not cancel the underlying
 * database query. Interactive transactions additionally get a real,
 * database-side timeout through `transactionOptions` in `prisma.ts`.
 */
export const prismaTimeoutExtension = (
  timeoutMs: number = PRISMA_OPERATION_TIMEOUT_MS,
) => {
  const timeoutPolicy = timeout(timeoutMs, TimeoutStrategy.Aggressive);

  return Prisma.defineExtension({
    name: 'operation-timeout',
    query: {
      $allOperations({ args, query }) {
        return timeoutPolicy.execute(() => query(args));
      },
    },
  });
};
