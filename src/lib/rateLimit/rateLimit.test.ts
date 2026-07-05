import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRatelimitMock = () => {
  const slidingWindow = vi.fn(() => 'window');
  const Ratelimit = vi.fn().mockImplementation(function (this: { options: unknown }, options: unknown) {
    this.options = options;
  }) as unknown as {
    new (options: unknown): unknown;
    slidingWindow: ReturnType<typeof vi.fn>;
  };

  Ratelimit.slidingWindow = slidingWindow;

  return { Ratelimit, slidingWindow };
};

vi.mock('@upstash/ratelimit', () => {
  const { Ratelimit } = createRatelimitMock();
  return { Ratelimit };
});

vi.mock('@/lib/redis/redis', () => ({
  rawRedisClient: {},
}));

describe('rate limit setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('creates rate limiters when redis is available', async () => {
    vi.doMock('@/lib/redis/redis', () => ({ rawRedisClient: {} }));
    const { rateLimiter: configuredRateLimiter, strictRateLimiter: configuredStrictRateLimiter } = await import('./rateLimit');

    expect(configuredRateLimiter).toBeDefined();
    expect(configuredStrictRateLimiter).toBeDefined();
  });

  it('falls back gracefully when limiter initialization throws', async () => {
    vi.doMock('@upstash/ratelimit', () => {
      const { Ratelimit } = createRatelimitMock();
      vi.mocked(Ratelimit).mockImplementation(() => {
        throw new Error('rate limit init failed');
      });

      return { Ratelimit };
    });
    vi.doMock('@/lib/redis/redis', () => ({ rawRedisClient: {} }));

    const { rateLimiter: fallbackRateLimiter, strictRateLimiter: fallbackStrictRateLimiter } = await import('./rateLimit');

    expect(fallbackRateLimiter).toBeNull();
    expect(fallbackStrictRateLimiter).toBeNull();
  });
});
