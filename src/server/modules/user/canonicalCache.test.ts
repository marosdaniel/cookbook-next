import { beforeEach, describe, expect, it, vi } from 'vitest';

const { store, fakeRedis, mockFindWithFavorites, mockFindFollowing } =
  vi.hoisted(() => {
    const entries = new Map<string, unknown>();
    return {
      store: entries,
      fakeRedis: {
        get: vi.fn(async (key: string) => entries.get(key) ?? null),
        setex: vi.fn(async (key: string, _ttl: number, value: unknown) => {
          entries.set(key, value);
          return 'OK';
        }),
        del: vi.fn(async (key: string) => {
          entries.delete(key);
          return 1;
        }),
        incr: vi.fn(async () => 1),
      },
      mockFindWithFavorites: vi.fn(),
      mockFindFollowing: vi.fn(),
    };
  });

vi.mock('@/lib/redis/redis', () => ({ redis: fakeRedis }));

vi.mock('./repository', () => ({
  UserRepository: {
    findWithFavoriteRecipes: mockFindWithFavorites,
    findFollowingAndCount: mockFindFollowing,
  },
}));

import { invalidateCacheScope } from '@/server/platform/cache';
import { FavoritesService } from './favoritesService';
import { FollowService } from './followService';

const makeRecipes = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
  }));

const makeFollows = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    following: {
      id: `${prefix}-${index + 1}`,
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: `ada-${index + 1}`,
      _count: { recipes: 1 },
      recipes: [],
    },
  }));

describe('canonical per-user cache entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
  });

  describe('FavoritesService.getFavoriteRecipes', () => {
    it('serves every limit from one canonical cache entry', async () => {
      mockFindWithFavorites.mockResolvedValue({
        favoriteRecipes: makeRecipes('recipe', 5),
      });

      const limited = await FavoritesService.getFavoriteRecipes('user-1', 2);
      const unlimited = await FavoritesService.getFavoriteRecipes('user-1');

      expect(limited.map((recipe) => recipe.id)).toEqual([
        'recipe-1',
        'recipe-2',
      ]);
      expect(unlimited).toHaveLength(5);
      expect(mockFindWithFavorites).toHaveBeenCalledTimes(1);
      expect(mockFindWithFavorites).toHaveBeenCalledWith('user-1');
    });

    it('refreshes every limit variant after the favorites are invalidated', async () => {
      mockFindWithFavorites.mockResolvedValue({
        favoriteRecipes: makeRecipes('old', 5),
      });
      await FavoritesService.getFavoriteRecipes('user-1', 2);

      mockFindWithFavorites.mockResolvedValue({
        favoriteRecipes: makeRecipes('new', 6),
      });
      await invalidateCacheScope({ favoriteUserId: 'user-1' });

      const refreshed = await FavoritesService.getFavoriteRecipes('user-1', 4);

      expect(refreshed.map((recipe) => recipe.id)).toEqual([
        'new-1',
        'new-2',
        'new-3',
        'new-4',
      ]);
      expect(mockFindWithFavorites).toHaveBeenCalledTimes(2);
    });
  });

  describe('FollowService.getFollowing', () => {
    it('serves every limit from one canonical cache entry', async () => {
      mockFindFollowing.mockResolvedValue([makeFollows('user', 3), 3]);

      const limited = await FollowService.getFollowing('user-1', 2);
      const unlimited = await FollowService.getFollowing('user-1');

      expect(limited.users.map((user) => user.id)).toEqual([
        'user-1',
        'user-2',
      ]);
      expect(limited.totalFollowing).toBe(3);
      expect(unlimited.users).toHaveLength(3);
      expect(mockFindFollowing).toHaveBeenCalledTimes(1);
      expect(mockFindFollowing).toHaveBeenCalledWith('user-1');
    });

    it('refreshes every limit variant after the follow list is invalidated', async () => {
      mockFindFollowing.mockResolvedValue([makeFollows('old', 3), 3]);
      await FollowService.getFollowing('user-1', 2);

      mockFindFollowing.mockResolvedValue([makeFollows('new', 4), 4]);
      await invalidateCacheScope({ followerUserId: 'user-1' });

      const refreshed = await FollowService.getFollowing('user-1', 3);

      expect(refreshed.users.map((user) => user.id)).toEqual([
        'new-1',
        'new-2',
        'new-3',
      ]);
      expect(refreshed.totalFollowing).toBe(4);
      expect(mockFindFollowing).toHaveBeenCalledTimes(2);
    });
  });
});
