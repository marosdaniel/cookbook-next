import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRedis, redisRef } = vi.hoisted(() => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
  };
  return {
    mockRedis,
    redisRef: { current: null as typeof mockRedis | null },
  };
});

vi.mock('@/lib/redis/redis', () => ({
  get redis() {
    return redisRef.current;
  },
}));

import {
  cached,
  cacheKeys,
  getCachedValue,
  getRecipeListVersion,
  invalidateCacheScope,
  reviveCachedDates,
  setCachedValue,
} from './cache';

describe('unified cache module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redisRef.current = mockRedis;
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

  describe('reviveCachedDates', () => {
    it('revives dates inside nested arrays and objects but leaves other strings alone', () => {
      const revived = reviveCachedDates({
        items: [{ followedAt: '2026-01-02T03:04:05.678Z' }],
        title: '2026-01-02T03:04:05Z',
        resetPasswordExpires: '2026-01-02T03:04:05Z',
      });

      expect(revived.items[0]?.followedAt).toBeInstanceOf(Date);
      expect(revived.title).toBe('2026-01-02T03:04:05Z');
      expect(revived.resetPasswordExpires).toBeInstanceOf(Date);
    });

    it('keeps existing Date instances, primitives and non-ISO date-field values unchanged', () => {
      const date = new Date('2026-01-01T00:00:00.000Z');

      expect(reviveCachedDates(date)).toBe(date);
      expect(reviveCachedDates(42)).toBe(42);
      expect(reviveCachedDates(undefined)).toBeUndefined();
      expect(reviveCachedDates({ createdAt: 'not-a-date' })).toEqual({
        createdAt: 'not-a-date',
      });
    });
  });

  describe('getCachedValue / setCachedValue', () => {
    it('returns null without touching Redis when no client is configured', async () => {
      redisRef.current = null;

      await expect(getCachedValue('any')).resolves.toBeNull();
      await expect(setCachedValue('any', { a: 1 })).resolves.toBeUndefined();
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('returns null when Redis get throws, instead of propagating the error', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('connection lost'));

      await expect(getCachedValue('recipe:1')).resolves.toBeNull();
    });

    it('returns null for a missing key (undefined from the client)', async () => {
      mockRedis.get.mockResolvedValueOnce(undefined);

      await expect(getCachedValue('recipe:1')).resolves.toBeNull();
    });

    it('writes with the default detail TTL when none is given', async () => {
      await setCachedValue('recipe:1', { id: '1' });

      expect(mockRedis.setex).toHaveBeenCalledWith('recipe:1', 60, {
        id: '1',
      });
    });

    it('writes with the provided TTL', async () => {
      await setCachedValue('recipes:list', [], 15);

      expect(mockRedis.setex).toHaveBeenCalledWith('recipes:list', 15, []);
    });

    it('swallows Redis write errors', async () => {
      mockRedis.setex.mockRejectedValueOnce(new Error('READONLY'));

      await expect(setCachedValue('recipe:1', {}, 60)).resolves.toBeUndefined();
    });
  });

  describe('cached', () => {
    it('replaces a cache hit rejected by shouldCache with the fresh value', async () => {
      mockRedis.get.mockResolvedValueOnce({ id: 'stale' });
      const load = vi.fn().mockResolvedValue({ id: 'fresh' });

      const result = await cached({
        key: 'recipe:stale-hit',
        ttlSeconds: 60,
        load,
        shouldCache: (value: { id: string }) => value.id === 'fresh',
      });

      expect(result).toEqual({ id: 'fresh' });
      expect(load).toHaveBeenCalledTimes(1);
      expect(mockRedis.setex).toHaveBeenCalledWith('recipe:stale-hit', 60, {
        id: 'fresh',
      });
    });

    it('does not store a freshly loaded value that shouldCache rejects', async () => {
      const load = vi.fn().mockResolvedValue(null);

      const result = await cached({
        key: 'recipe:not-cacheable',
        ttlSeconds: 60,
        load,
        shouldCache: (value: unknown) => value !== null,
      });

      expect(result).toBeNull();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('stores a freshly loaded value that shouldCache accepts', async () => {
      const load = vi.fn().mockResolvedValue({ id: 'ok' });

      await cached({
        key: 'recipe:cacheable',
        ttlSeconds: 30,
        load,
        shouldCache: () => true,
      });

      expect(mockRedis.setex).toHaveBeenCalledWith('recipe:cacheable', 30, {
        id: 'ok',
      });
    });

    it('propagates load errors and clears the in-flight entry so the next call retries', async () => {
      const load = vi
        .fn()
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValueOnce({ id: 'recovered' });

      await expect(
        cached({ key: 'recipe:retry', ttlSeconds: 60, load }),
      ).rejects.toThrow('db down');

      await expect(
        cached({ key: 'recipe:retry', ttlSeconds: 60, load }),
      ).resolves.toEqual({ id: 'recovered' });
      expect(load).toHaveBeenCalledTimes(2);
    });

    it('loads directly when Redis is unavailable', async () => {
      redisRef.current = null;
      const load = vi.fn().mockResolvedValue({ id: 'no-redis' });

      await expect(
        cached({ key: 'recipe:no-redis', ttlSeconds: 60, load }),
      ).resolves.toEqual({ id: 'no-redis' });
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe('getRecipeListVersion', () => {
    it('returns the stored numeric version', async () => {
      mockRedis.get.mockResolvedValueOnce(7);

      await expect(getRecipeListVersion()).resolves.toBe(7);
    });

    it('falls back to version 1 when nothing is stored', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      await expect(getRecipeListVersion()).resolves.toBe(1);
    });
  });

  describe('invalidateCacheScope', () => {
    it('does nothing when Redis is unavailable', async () => {
      redisRef.current = null;

      await invalidateCacheScope({
        recipeId: 'r1',
        invalidateRecipeLists: true,
      });

      expect(mockRedis.del).not.toHaveBeenCalled();
      expect(mockRedis.incr).not.toHaveBeenCalled();
    });

    it('clears favorites, following, session version and metadata keys for the given users', async () => {
      await invalidateCacheScope({
        favoriteUserId: 'u1',
        followerUserId: 'u2',
        sessionUserId: 'u3',
        metadataActive: true,
      });

      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userFavorites('u1', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userFollowing('u2', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.sessionVersion('u3'),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(cacheKeys.metadataActive);
    });

    it('clears every per-user entry for userIds and all author ids, skipping empty slugs', async () => {
      await invalidateCacheScope({
        authorIds: ['a1'],
        userIds: ['u9'],
        slugs: [null, undefined, ''],
      });

      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userRecipes('a1', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userRecipes('u9', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userFavorites('u9', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.userFollowing('u9', undefined),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(
        cacheKeys.sessionVersion('u9'),
      );
      expect(mockRedis.del).toHaveBeenCalledTimes(5);
    });

    it('deletes keys in batches of 100 and deduplicates overlapping keys', async () => {
      const recipeIds = Array.from({ length: 120 }, (_, i) => `r${i}`);

      await invalidateCacheScope({
        recipeIds,
        recipeId: 'r0',
      });

      // Two keys per recipe (detail + lookup), r0 repeated and deduplicated.
      expect(mockRedis.del).toHaveBeenCalledTimes(240);
    });

    it('swallows Redis errors during deletion and list-version bump', async () => {
      mockRedis.del.mockRejectedValueOnce(new Error('timeout'));

      await expect(
        invalidateCacheScope({ recipeId: 'r1', invalidateRecipeLists: true }),
      ).resolves.toBeUndefined();
    });

    it('does not bump the list version unless requested', async () => {
      await invalidateCacheScope({ recipeId: 'r1' });

      expect(mockRedis.incr).not.toHaveBeenCalled();
    });
  });
});
