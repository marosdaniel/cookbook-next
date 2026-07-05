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

  it('stops retrying Redis after a transient failure', async () => {
    redisGetMock.mockRejectedValueOnce(new Error('dns failure'));

    const { redis } = await import('./redis');

    expect(await redis?.get('key')).toBeNull();
    expect(await redis?.get('key')).toBeNull();
    expect(redisGetMock).toHaveBeenCalledTimes(1);
  });

  it('throws when a Redis operation times out', async () => {
    vi.useFakeTimers();
    const { withTimeout } = await import('./redis');

    const pendingOperation = withTimeout(() => new Promise<string>(() => {}), 250);

    vi.advanceTimersByTime(250);

    await expect(pendingOperation).rejects.toThrow('Redis operation timed out after 250ms');
  });
});
