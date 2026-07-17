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
}

const isRedisDisabled = () => Date.now() < redisFailureUntil;

const markRedisFailure = () => {
  redisFailureUntil = Date.now() + REDIS_FAILURE_TTL_MS;
};

export const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = REDIS_OPERATION_TIMEOUT_MS,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Redis operation timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([operation(), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const wrapWithCircuitBreaker = async <T>(
  operation: () => Promise<T>,
): Promise<T | null> => {
  if (isRedisDisabled()) {
    return null;
  }

  try {
    return await withTimeout(operation);
  } catch (error) {
    console.warn(
      'Redis unavailable. Disabling cache for a short period.',
      error,
    );
    markRedisFailure();
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
    }
  : null;

export { redisWithCircuitBreaker as redis };
