import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';
import { deleteRating } from './deleteRating';

const { mockResolveAuthenticatedUser, mockDeleteRating } = vi.hoisted(() => ({
  mockResolveAuthenticatedUser: vi.fn(),
  mockDeleteRating: vi.fn(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    deleteRating: mockDeleteRating,
  },
}));

vi.mock('../utils', () => ({
  resolveAuthenticatedUser: mockResolveAuthenticatedUser,
}));

describe('deleteRating resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates deletion of a rating to the recipe service', async () => {
    mockResolveAuthenticatedUser.mockResolvedValue({ id: 'user-1' });
    mockDeleteRating.mockResolvedValue(true);

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteRating({}, { recipeId: 'recipe-1' }, context);

    expect(mockResolveAuthenticatedUser).toHaveBeenCalled();
    expect(mockDeleteRating).toHaveBeenCalledWith('user-1', 'recipe-1');
    expect(result).toBe(true);
  });
});
