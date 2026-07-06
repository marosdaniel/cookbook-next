import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';
import { rateRecipe } from './rateRecipe';

const { mockResolveAuthenticatedUser, mockRateRecipe } = vi.hoisted(() => ({
  mockResolveAuthenticatedUser: vi.fn(),
  mockRateRecipe: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    rateRecipe: mockRateRecipe,
  },
}));

vi.mock('../utils', () => ({
  resolveAuthenticatedUser: mockResolveAuthenticatedUser,
}));

describe('rateRecipe resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates rating to the recipe service', async () => {
    mockResolveAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    mockRateRecipe.mockResolvedValue({ id: 'recipe-1' });

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await rateRecipe(
      {},
      { ratingInput: { recipeId: 'recipe-1', ratingValue: 5 } },
      context,
    );

    expect(mockResolveAuthenticatedUser).toHaveBeenCalled();
    expect(mockRateRecipe).toHaveBeenCalledWith('user-1', {
      recipeId: 'recipe-1',
      ratingValue: 5,
    });
    expect(result).toEqual({ id: 'recipe-1' });
  });
});
