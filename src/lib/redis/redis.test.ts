import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const redisGetMock = vi.fn();
const redisSetexMock = vi.fn();
const redisDelMock = vi.fn();

vi.mock('@upstash/redis', () => {
  class Redis {
    get = redisGetMock;
    setex = redisSetexMock;
    del = redisDelMock;
  }

  return { Redis };
});

describe('redis client fallback', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops retrying Redis after reaching the consecutive failure threshold (default 3)', async () => {
    redisGetMock.mockRejectedValue(new Error('dns failure'));

    const { redis } = await import('./redis');

    expect(await redis?.get('key')).toBeNull();
    expect(await redis?.get('key')).toBeNull();
    expect(await redis?.get('key')).toBeNull();
    // 4th call is short-circuited by the open breaker
    expect(await redis?.get('key')).toBeNull();
    expect(redisGetMock).toHaveBeenCalledTimes(3);
  });

  it('retries Redis after the cool-down period and closes the circuit on success', async () => {
    vi.useFakeTimers();
    process.env.REDIS_BREAKER_THRESHOLD = '1';
    redisGetMock
      .mockRejectedValueOnce(new Error('dns failure'))
      .mockResolvedValue('cached');

    const { redis } = await import('./redis');

    expect(await redis?.get('key')).toBeNull();
    expect(await redis?.get('key')).toBeNull();
    expect(redisGetMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5_000);

    expect(await redis?.get('key')).toBe('cached');
    expect(await redis?.get('key')).toBe('cached');
    expect(redisGetMock).toHaveBeenCalledTimes(3);
    delete process.env.REDIS_BREAKER_THRESHOLD;
  });

  it('opens the circuit when Redis operations exceed the timeout threshold', async () => {
    vi.useFakeTimers();
    process.env.REDIS_BREAKER_THRESHOLD = '1';
    redisGetMock.mockImplementation(() => new Promise(() => {}));

    const { redis } = await import('./redis');

    const pending = redis?.get('key');
    await vi.advanceTimersByTimeAsync(1_000);

    expect(await pending).toBeNull();
    expect(await redis?.get('key')).toBeNull();
    expect(redisGetMock).toHaveBeenCalledTimes(1);
    delete process.env.REDIS_BREAKER_THRESHOLD;
  });

  it('does not initialize Redis when the URL is invalid', async () => {
    process.env.UPSTASH_REDIS_REST_URL = '[SENSITIVE]';

    const { redis, rawRedisClient } = await import('./redis');

    expect(redis).toBeNull();
    expect(rawRedisClient).toBeNull();
  });

  it('throws when a Redis operation times out', async () => {
    vi.useFakeTimers();
    const { withTimeout } = await import('./redis');

    const pendingOperation = withTimeout(
      () => new Promise<string>(() => {}),
      250,
    );

    vi.advanceTimersByTime(250);

    await expect(pendingOperation).rejects.toThrow(
      'Operation timed out after 250ms',
    );
  });
});
