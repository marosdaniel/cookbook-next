import { beforeEach, describe, expect, it, vi } from 'vitest';

const { store, fakeRedis, mockFindMany, mockCount } = vi.hoisted(() => {
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
    mockFindMany: vi.fn(),
    mockCount: vi.fn(),
  };
});

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    recipe: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

vi.mock('@/lib/redis/redis', () => ({ redis: fakeRedis }));

vi.mock('@/lib/services/MetadataService', () => ({
  MetadataService: {
    getTranslationKeyLookup: vi.fn(async () => new Map<string, string>()),
  },
  metadataLookupKey: (type: string, key: string) => `${type}:${key}`,
}));

import { invalidateCacheScope } from '@/server/platform/cache';
import { DEFAULT_QUERY_MAX_LIMIT } from '@/server/platform/pagination';
import { RecipeService } from './RecipeService';

const makeRecipes = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
  }));

describe('RecipeService.getRecipesByUserId canonical cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.clear();
  });

  it('serves every limit from one bounded cache entry', async () => {
    mockFindMany.mockResolvedValue(makeRecipes('recipe', 5));
    mockCount.mockResolvedValue(5);

    const limited = await RecipeService.getRecipesByUserId('user-1', 2);
    const unlimited = await RecipeService.getRecipesByUserId('user-1');

    expect(limited.recipes.map((recipe) => recipe.id)).toEqual([
      'recipe-1',
      'recipe-2',
    ]);
    expect(limited.totalRecipes).toBe(5);
    expect(unlimited.recipes).toHaveLength(5);
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdBy: 'user-1' },
        take: DEFAULT_QUERY_MAX_LIMIT,
      }),
    );
  });

  it('refreshes every limit variant after the author cache is invalidated', async () => {
    mockFindMany.mockResolvedValue(makeRecipes('old', 5));
    mockCount.mockResolvedValue(5);
    await RecipeService.getRecipesByUserId('user-1', 2);

    mockFindMany.mockResolvedValue(makeRecipes('new', 6));
    mockCount.mockResolvedValue(6);
    await invalidateCacheScope({ authorId: 'user-1' });

    const refreshed = await RecipeService.getRecipesByUserId('user-1', 3);

    expect(refreshed.recipes.map((recipe) => recipe.id)).toEqual([
      'new-1',
      'new-2',
      'new-3',
    ]);
    expect(refreshed.totalRecipes).toBe(6);
    expect(mockFindMany).toHaveBeenCalledTimes(2);
  });
});
