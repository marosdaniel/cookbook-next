import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockDeleteAllRecipes, mockThrowCustomError } = vi.hoisted(() => ({
  mockDeleteAllRecipes: vi.fn(),
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    deleteAllRecipes: mockDeleteAllRecipes,
  },
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { deleteAllRecipes } from './deleteAllRecipes';

describe('deleteAllRecipes resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized error when the caller is not authenticated', async () => {
    mockThrowCustomError.mockReturnValue('unauthorized');

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteAllRecipes({}, { confirmation: 'yes' }, context);

    expect(mockThrowCustomError).toHaveBeenCalled();
    expect(result).toBe('unauthorized');
  });

  it('delegates the deletion request to the user service', async () => {
    mockDeleteAllRecipes.mockResolvedValue(3);

    const context: GraphQLContext = {
      userId: 'user-1',
      role: 'USER',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteAllRecipes({}, { confirmation: 'yes' }, context);

    expect(mockDeleteAllRecipes).toHaveBeenCalledWith('user-1', 'USER', 'yes');
    expect(result).toBe(3);
  });
});
