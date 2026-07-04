import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@upstash/ratelimit', () => {
  const Ratelimit = vi.fn().mockImplementation(function (this: { options: unknown }, options: unknown) {
    this.options = options;
  });
  Ratelimit.slidingWindow = vi.fn(() => 'window');

  return { Ratelimit };
});

vi.mock('@/lib/redis/redis', () => ({
  redis: {},
}));

import { rateLimiter, strictRateLimiter } from './rateLimit';

describe('rate limit setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates rate limiters when redis is available', () => {
    expect(rateLimiter).toBeDefined();
    expect(strictRateLimiter).toBeDefined();
  });
});
