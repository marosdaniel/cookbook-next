import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis/redis';

// Default global rate limiter: 100 requests per 60 seconds per IP
export const rateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      analytics: true,
      prefix: 'ratelimit:graphql',
    })
  : null;

// More strict rate limiter for sensitive operations (e.g., reset password)
// 5 requests per 10 minutes
export const strictRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: true,
      prefix: 'ratelimit:graphql:strict',
    })
  : null;
