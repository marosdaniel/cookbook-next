import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
  },
}));

vi.mock('@/lib/redis/redis', () => ({
  redis: mockRedis,
}));

import {
  cached,
  cacheKeys,
  invalidateCacheScope,
  reviveCachedDates,
} from './cache';

describe('unified cache module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue('OK');
    mockRedis.del.mockResolvedValue(1);
    mockRedis.incr.mockResolvedValue(2);
  });

  it('revives ISO date strings in cached objects so cached and fresh shapes match', async () => {
    const freshDate = new Date('2026-10-29T12:00:00.000Z');
    mockRedis.get.mockResolvedValueOnce({
      id: 'recipe-1',
      title: 'Goulash',
      createdAt: freshDate.toISOString(),
      updatedAt: freshDate.toISOString(),
    });

    const load = vi.fn();
    const result = await cached<{
      id: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
    }>({
      key: cacheKeys.recipeDetail('recipe-1'),
      ttlSeconds: 60,
      load,
    });

    expect(load).not.toHaveBeenCalled();
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe(freshDate.toISOString());
    expect(reviveCachedDates(null)).toBeNull();
  });

  it('deduplicates concurrent cache misses with single-flight protection', async () => {
    let resolveLoad!: (value: { id: string }) => void;
    const load = vi.fn(
      () =>
        new Promise<{ id: string }>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    const p1 = cached({
      key: 'recipe:single-flight',
      ttlSeconds: 60,
      load,
    });
    const p2 = cached({
      key: 'recipe:single-flight',
      ttlSeconds: 60,
      load,
    });

    // Wait a microtask for getCachedValue to settle
    await new Promise((r) => setTimeout(r, 5));
    resolveLoad({ id: 'recipe-sf' });

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual({ id: 'recipe-sf' });
    expect(r2).toEqual({ id: 'recipe-sf' });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('invalidates detail, lookup (id and slug), author, and list version keys together', async () => {
    await invalidateCacheScope({
      recipeId: 'recipe-1',
      slugs: ['traditional-goulash'],
      authorId: 'user-1',
      invalidateRecipeLists: true,
    });

    expect(mockRedis.del).toHaveBeenCalledWith('recipe:recipe-1');
    expect(mockRedis.del).toHaveBeenCalledWith('recipe:lookup:recipe-1');
    expect(mockRedis.del).toHaveBeenCalledWith(
      'recipe:lookup:traditional-goulash',
    );
    expect(mockRedis.del).toHaveBeenCalledWith('recipes:user:user-1:all');
    expect(mockRedis.incr).toHaveBeenCalledWith('recipes:list:version');
  });
});
