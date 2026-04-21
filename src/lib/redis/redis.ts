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

export { redis };
