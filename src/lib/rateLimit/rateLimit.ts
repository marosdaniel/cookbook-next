import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { rawRedisClient } from '@/lib/redis/redis';

export type RateLimitOperation = 'resetPassword' | 'createRecipe' | 'editRecipe' | 'getRecipes';

const createLimiter = (prefix: string, window: Duration, requests: number) => {
  if (!rawRedisClient) {
    return null;
  }

  try {
    return new Ratelimit({
      redis: rawRedisClient,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix,
    });
  } catch (error) {
    console.warn(`Rate limiter initialization failed for ${prefix}.`, error);
    return null;
  }
};

const shouldUseLimiter = Boolean(rawRedisClient);

// Default global rate limiter: 100 requests per 60 seconds per IP
export const rateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql', '60 s', 100)
  : null;

// More strict rate limiter for sensitive operations (e.g., reset password)
// 5 requests per 10 minutes
export const strictRateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql:strict', '10 m', 5)
  : null;

export const getRateLimiterForOperation = (
  operation: RateLimitOperation,
) => {
  if (operation === 'resetPassword' || operation === 'createRecipe' || operation === 'editRecipe') {
    return strictRateLimiter ?? rateLimiter;
  }

  return rateLimiter;
};
