import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    recipe: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    rating: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/redis/redis', () => ({
  redis: null,
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: vi.fn((message: string, errorType: { errorCode: string }) => {
    throw new Error(`${message}:${errorType.errorCode}`);
  }),
}));

import { assertRecipeResourceAccess, RecipeService } from './RecipeService';

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
      createdBy: 'user-2',
    } as unknown as Awaited<ReturnType<typeof prisma.recipe.findUnique>>);

    await expect(
      RecipeService.deleteRecipe('user-1', 'USER', 'recipe-1'),
    ).rejects.toThrow('Not authorized to edit this recipe:FORBIDDEN');
  });
});
