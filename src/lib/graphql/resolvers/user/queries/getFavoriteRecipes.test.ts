import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockGetFavoriteRecipes } = vi.hoisted(() => ({
  mockGetFavoriteRecipes: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    getFavoriteRecipes: mockGetFavoriteRecipes,
  },
}));

import { getFavoriteRecipes } from './getFavoriteRecipes';

describe('getFavoriteRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates favorite recipe queries to the user service', async () => {
    mockGetFavoriteRecipes.mockResolvedValue([]);

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await getFavoriteRecipes(
      {},
      { userId: 'user-1', limit: 2 },
      context,
    );

    expect(mockGetFavoriteRecipes).toHaveBeenCalledWith('user-1', 2);
    expect(result).toEqual([]);
  });
});
