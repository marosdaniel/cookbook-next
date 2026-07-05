import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis/redis';

const createLimiter = (prefix: string, window: string, requests: number) => {
  if (!redis) {
    return null;
  }

  try {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix,
    });
  } catch (error) {
    console.warn(`Rate limiter initialization failed for ${prefix}.`, error);
    return null;
  }
};

const shouldUseLimiter = Boolean(redis);

// Default global rate limiter: 100 requests per 60 seconds per IP
export const rateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql', '60 s', 100)
  : null;

// More strict rate limiter for sensitive operations (e.g., reset password)
// 5 requests per 10 minutes
export const strictRateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql:strict', '10 m', 5)
  : null;
