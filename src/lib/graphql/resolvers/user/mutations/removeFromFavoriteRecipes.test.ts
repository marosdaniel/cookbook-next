import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockRemoveFromFavoriteRecipes } = vi.hoisted(() => ({
  mockRemoveFromFavoriteRecipes: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    removeFromFavoriteRecipes: mockRemoveFromFavoriteRecipes,
  },
}));

import { removeFromFavoriteRecipes } from './removeFromFavoriteRecipes';

describe('removeFromFavoriteRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates favorite removals to the user service', async () => {
    mockRemoveFromFavoriteRecipes.mockResolvedValue({
      success: true,
      message: 'ok',
      statusCode: 200,
    });

    const context: GraphQLContext = {
      userId: 'user-1',
      role: 'USER',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await removeFromFavoriteRecipes(
      {},
      { userId: 'user-2', recipeId: 'recipe-1' },
      context,
    );

    expect(mockRemoveFromFavoriteRecipes).toHaveBeenCalledWith(
      'user-1',
      'USER',
      'user-2',
      'recipe-1',
    );
    expect(result).toEqual({ success: true, message: 'ok', statusCode: 200 });
  });
});
