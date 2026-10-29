import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRatelimitMock = () => {
  const slidingWindow = vi.fn(() => 'window');

  const Ratelimit = vi.fn(function (
    this: { options: unknown },
    options: unknown,
  ) {
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
    const {
      rateLimiter: configuredRateLimiter,
      strictRateLimiter: configuredStrictRateLimiter,
    } = await import('./rateLimit');

    expect(configuredRateLimiter).toBeDefined();
    expect(configuredStrictRateLimiter).toBeDefined();
  });

  it('falls back gracefully when limiter initialization throws', async () => {
    vi.doMock('@upstash/ratelimit', () => {
      const ThrowingRatelimit = class {
        static readonly slidingWindow = vi.fn(() => 'window');

        constructor(_options: unknown) {
          throw new Error('rate limit init failed');
        }
      };

      return { Ratelimit: ThrowingRatelimit };
    });
    vi.doMock('@/lib/redis/redis', () => ({ rawRedisClient: {} }));

    const {
      rateLimiter: fallbackRateLimiter,
      strictRateLimiter: fallbackStrictRateLimiter,
    } = await import('./rateLimit');

    expect(fallbackRateLimiter).toBeNull();
    expect(fallbackStrictRateLimiter).toBeNull();
  });

  it('selects per-group limiters for sensitive operations', async () => {
    const {
      adminRateLimiter,
      authSensitiveRateLimiter,
      contentWriteRateLimiter,
      getRateLimiterForOperation,
      passwordChangeRateLimiter,
      rateLimiter: configuredRateLimiter,
      ratingRateLimiter,
    } = await import('./rateLimit');

    expect(getRateLimiterForOperation('resetPassword')).toBe(
      authSensitiveRateLimiter,
    );
    expect(getRateLimiterForOperation('setNewPassword')).toBe(
      authSensitiveRateLimiter,
    );
    expect(getRateLimiterForOperation('createUser')).toBe(
      authSensitiveRateLimiter,
    );
    expect(getRateLimiterForOperation('changePassword')).toBe(
      passwordChangeRateLimiter,
    );
    expect(getRateLimiterForOperation('createRecipe')).toBe(
      contentWriteRateLimiter,
    );
    expect(getRateLimiterForOperation('editRecipe')).toBe(
      contentWriteRateLimiter,
    );
    expect(getRateLimiterForOperation('deleteRecipe')).toBe(
      contentWriteRateLimiter,
    );
    expect(getRateLimiterForOperation('rateRecipe')).toBe(ratingRateLimiter);
    expect(getRateLimiterForOperation('deleteRating')).toBe(ratingRateLimiter);
    expect(getRateLimiterForOperation('setMetadataActive')).toBe(
      adminRateLimiter,
    );
    expect(getRateLimiterForOperation('getRecipes')).toBe(
      configuredRateLimiter,
    );
  });

  it('hashes email identifiers with SHA-256 and enforces in-memory fallback', async () => {
    const {
      createInMemoryLimiter,
      executeRateLimitWithFallback,
      hashRateLimitIdentifier,
    } = await import('./rateLimit');

    const hashA = hashRateLimitIdentifier('User@Example.com');
    const hashB = hashRateLimitIdentifier('user@example.com');
    expect(hashA).toBe(hashB);
    expect(hashA).not.toContain('example.com');
    expect(hashA).toHaveLength(64);

    const fallback = createInMemoryLimiter(2, 60_000);
    const first = await executeRateLimitWithFallback(null, fallback, hashA);
    const second = await executeRateLimitWithFallback(null, fallback, hashA);
    const third = await executeRateLimitWithFallback(null, fallback, hashA);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(third.success).toBe(false);
  });
});
