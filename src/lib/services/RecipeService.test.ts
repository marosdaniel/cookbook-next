import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRedis } = vi.hoisted(() => ({
  mockRedis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
  },
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    recipe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    rating: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/redis/redis', () => ({
  redis: mockRedis,
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: vi.fn((message: string, errorType: { errorCode: string }) => {
    throw new Error(`${message}:${errorType.errorCode}`);
  }),
}));

import { assertRecipeResourceAccess, RecipeService } from './RecipeService';

describe('RecipeService cache resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue(undefined);
    mockRedis.del.mockResolvedValue(undefined);
  });

  it('continues when Redis cache set fails', async () => {
    const { prisma } = await import('@/lib/prisma/prisma');
    vi.mocked(prisma.recipe.findMany).mockResolvedValue([]);
    vi.mocked(prisma.recipe.count).mockResolvedValue(0);
    vi.mocked(mockRedis.get).mockResolvedValue(null);
    vi.mocked(mockRedis.setex).mockRejectedValue(new Error('upstash unavailable'));

    await expect(RecipeService.getRecipes()).resolves.toEqual({ recipes: [], totalRecipes: 0 });
  });

  it('stores recipe list caches with a shorter ttl to reduce stale list data', async () => {
    const { prisma } = await import('@/lib/prisma/prisma');
    vi.mocked(prisma.recipe.findMany).mockResolvedValue([]);
    vi.mocked(prisma.recipe.count).mockResolvedValue(0);

    await RecipeService.getRecipes();

    expect(mockRedis.setex).toHaveBeenCalledWith(
      expect.any(String),
      15,
      expect.objectContaining({ recipes: [], totalRecipes: 0 }),
    );
  });

  it('rejects ratings outside the supported 1-5 range', async () => {
    const { prisma } = await import('@/lib/prisma/prisma');
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: 'recipe-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Test recipe',
      description: null,
      category: null,
      labels: null,
      imgSrc: null,
      cookingTime: 30,
      difficultyLevel: null,
      servings: 2,
      youtubeLink: null,
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      restTimeMinutes: null,
      totalTimeMinutes: null,
      servingUnit: null,
      cuisine: null,
      dietaryFlags: null,
      allergens: null,
      equipment: null,
      costLevel: null,
      tips: null,
      substitutions: null,
      slug: null,
      seoTitle: null,
      seoDescription: null,
      socialImage: null,
      createdBy: 'user-1',
    } as Awaited<ReturnType<typeof prisma.recipe.findUnique>>);

    await expect(
      RecipeService.rateRecipe('user-1', {
        recipeId: 'recipe-1',
        ratingValue: 6,
      }),
    ).rejects.toThrow('Rating must be between 1 and 5');
  });
});

describe('assertRecipeResourceAccess', () => {
  it('allows admins to edit any recipe', () => {
    expect(() =>
      assertRecipeResourceAccess('user-1', 'ADMIN', { createdBy: 'user-2' }),
    ).not.toThrow();
  });

  it('allows owners to edit their own recipe', () => {
    expect(() =>
      assertRecipeResourceAccess('user-1', 'USER', { createdBy: 'user-1' }),
    ).not.toThrow();
  });

  it('blocks non-owners from editing another user recipe', () => {
    expect(() =>
      assertRecipeResourceAccess('user-1', 'USER', { createdBy: 'user-2' }),
    ).toThrow('Not authorized to edit this recipe:FORBIDDEN');
  });

  it('blocks non-owners from deleting another user recipe', async () => {
    const { prisma } = await import('@/lib/prisma/prisma');
    vi.mocked(prisma.recipe.findUnique).mockResolvedValue({
      id: 'recipe-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Test recipe',
      description: null,
      category: null,
      labels: null,
      imgSrc: null,
      cookingTime: 30,
      difficultyLevel: null,
      servings: 2,
      youtubeLink: null,
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      restTimeMinutes: null,
      totalTimeMinutes: null,
      servingUnit: null,
      cuisine: null,
      dietaryFlags: null,
      allergens: null,
      equipment: null,
      costLevel: null,
      tips: null,
      substitutions: null,
      slug: null,
      seoTitle: null,
      seoDescription: null,
      socialImage: null,
      createdBy: 'user-2',
    } as Awaited<ReturnType<typeof prisma.recipe.findUnique>>);

    await expect(
      RecipeService.deleteRecipe('user-1', 'USER', 'recipe-1'),
    ).rejects.toThrow('Not authorized to edit this recipe:FORBIDDEN');
  });
});
