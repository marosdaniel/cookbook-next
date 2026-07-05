import { Redis } from '@upstash/redis';

// We create a singleton Redis instance that gets its URL and token from the environment variables:
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
// By using fromEnv, we don't need to pass them explicitly if they are named this way.
// As a fallback, we pass them explicitly for completeness and better error handling.

// We support both manual Upstash variables and Vercel KV integration variables
export const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
export const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const REDIS_FAILURE_TTL_MS = 5_000;
const REDIS_OPERATION_TIMEOUT_MS = 1_000;
let redisFailureUntil = 0;

const isRedisDisabled = () => Date.now() < redisFailureUntil;

const markRedisFailure = () => {
  redisFailureUntil = Date.now() + REDIS_FAILURE_TTL_MS;
};

export const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = REDIS_OPERATION_TIMEOUT_MS,
): Promise<T | null> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), timeoutMs);
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const wrapWithCircuitBreaker = <T>(operation: () => Promise<T>): Promise<T | null> => {
  if (isRedisDisabled()) {
    return Promise.resolve(null);
  }

  return withTimeout(operation)
    .then((result) => result)
    .catch((error) => {
      console.warn('Redis unavailable. Disabling cache for a short period.', error);
      markRedisFailure();
      return null;
    });
};

// Only initialize if the environment variables are present to avoid startup crashes if they are not yet configured
const redis: Redis | null =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

if (!redis) {
  console.warn('Upstash Redis URL or Token is missing. Caching will not work.');
}

const redisWithCircuitBreaker = redis
  ? {
      ...redis,
      get: (key: string) => wrapWithCircuitBreaker(() => redis.get(key)),
      setex: (key: string, ttl: number, value: unknown) =>
        wrapWithCircuitBreaker(() => redis.setex(key, ttl, value)),
      del: (key: string) => wrapWithCircuitBreaker(() => redis.del(key)),
    }
  : null;

export { redisWithCircuitBreaker as redis };
