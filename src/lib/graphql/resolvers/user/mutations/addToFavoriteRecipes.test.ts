import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockAddToFavoriteRecipes } = vi.hoisted(() => ({
  mockAddToFavoriteRecipes: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    addToFavoriteRecipes: mockAddToFavoriteRecipes,
  },
}));

import { addToFavoriteRecipes } from './addToFavoriteRecipes';

describe('addToFavoriteRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates favorite additions to the user service', async () => {
    mockAddToFavoriteRecipes.mockResolvedValue({
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

    const result = await addToFavoriteRecipes(
      {},
      { userId: 'user-2', recipeId: 'recipe-1' },
      context,
    );

    expect(mockAddToFavoriteRecipes).toHaveBeenCalledWith(
      'user-1',
      'USER',
      'user-2',
      'recipe-1',
    );
    expect(result).toEqual({ success: true, message: 'ok', statusCode: 200 });
  });
});
