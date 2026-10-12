import { Redis } from '@upstash/redis';
import {
  ConsecutiveBreaker,
  circuitBreaker,
  handleAll,
  TimeoutStrategy,
  timeout,
  wrap,
} from 'cockatiel';
import { env } from '@/env';

// We create a singleton Redis instance that gets its URL and token from the environment variables:
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
// By using fromEnv, we don't need to pass them explicitly if they are named this way.
// As a fallback, we pass them explicitly for completeness and better error handling.

// We support both manual Upstash variables and Vercel KV integration variables
export const redisUrl = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
export const redisToken = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;

const REDIS_FAILURE_TTL_MS = 5_000;
const REDIS_OPERATION_TIMEOUT_MS = 1_000;

const isValidRedisUrl = (value: string | undefined) => {
  if (!value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidRedisConfig = (
  url: string | undefined,
  token: string | undefined,
) => Boolean(url && token && isValidRedisUrl(url));

interface RedisWithCircuitBreaker {
  get: (key: string) => Promise<unknown>;
  setex: (key: string, ttl: number, value: unknown) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
  incr: (key: string) => Promise<unknown>;
}

// A single failure (including a timeout) opens the circuit; after the
// cool-down one trial call decides whether it closes again.
const redisBreaker = circuitBreaker(handleAll, {
  halfOpenAfter: REDIS_FAILURE_TTL_MS,
  breaker: new ConsecutiveBreaker(1),
});

redisBreaker.onBreak((reason) => {
  console.warn(
    'Redis unavailable. Disabling cache for a short period.',
    'error' in reason ? reason.error : undefined,
  );
});

const redisPolicy = wrap(
  redisBreaker,
  timeout(REDIS_OPERATION_TIMEOUT_MS, TimeoutStrategy.Aggressive),
);

/**
 * Rejects with a cockatiel `TaskCancelledError` if the operation does not
 * settle in time. It does not cancel the underlying request.
 */
export const withTimeout = <T>(
  operation: () => Promise<T>,
  timeoutMs: number = REDIS_OPERATION_TIMEOUT_MS,
): Promise<T> =>
  timeout(timeoutMs, TimeoutStrategy.Aggressive).execute(() => operation());

const wrapWithCircuitBreaker = async <T>(
  operation: () => Promise<T>,
): Promise<T | null> => {
  try {
    return await redisPolicy.execute(() => operation());
  } catch {
    // Failures are logged by the breaker's onBreak handler; callers treat
    // Redis as a best-effort cache and fall back to the database.
    return null;
  }
};

// Only initialize if the environment variables are present and valid to avoid startup crashes if they are not yet configured
const redis: Redis | null = isValidRedisConfig(redisUrl, redisToken)
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;

export const rawRedisClient: Redis | null = redis;

if (!redis) {
  console.warn(
    'Upstash Redis URL or Token is missing or invalid. Caching will not work.',
  );
}

const redisWithCircuitBreaker: RedisWithCircuitBreaker | null = redis
  ? {
      get: (key: string) => wrapWithCircuitBreaker(() => redis.get(key)),
      setex: (key: string, ttl: number, value: unknown) =>
        wrapWithCircuitBreaker(() => redis.setex(key, ttl, value)),
      del: (key: string) => wrapWithCircuitBreaker(() => redis.del(key)),
      incr: (key: string) => wrapWithCircuitBreaker(() => redis.incr(key)),
    }
  : null;

export { redisWithCircuitBreaker as redis };
