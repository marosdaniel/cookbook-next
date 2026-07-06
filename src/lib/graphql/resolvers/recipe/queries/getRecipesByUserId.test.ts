import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockGetRecipesByUserId } = vi.hoisted(() => ({
  mockGetRecipesByUserId: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    getRecipesByUserId: mockGetRecipesByUserId,
  },
}));

import { getRecipesByUserId } from './getRecipesByUserId';

describe('getRecipesByUserId resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates the user recipe query to the recipe service', async () => {
    mockGetRecipesByUserId.mockResolvedValue({ recipes: [], totalRecipes: 0 });

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await getRecipesByUserId(
      {},
      { userId: 'user-1', limit: 3 },
      context,
    );

    expect(mockGetRecipesByUserId).toHaveBeenCalledWith('user-1', 3);
    expect(result).toEqual({ recipes: [], totalRecipes: 0 });
  });
});
