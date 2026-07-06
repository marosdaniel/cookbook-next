import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockDeleteAllUser, mockThrowCustomError } = vi.hoisted(() => ({
  mockDeleteAllUser: vi.fn(),
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    deleteAllUser: mockDeleteAllUser,
  },
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { deleteAllUser } from './deleteAllUser';

describe('deleteAllUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized error when the caller is not authenticated', async () => {
    mockThrowCustomError.mockReturnValue('unauthorized');

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteAllUser({}, { confirmation: 'yes' }, context);

    expect(mockThrowCustomError).toHaveBeenCalled();
    expect(result).toBe('unauthorized');
  });

  it('delegates the request to the user service', async () => {
    mockDeleteAllUser.mockResolvedValue(2);

    const context: GraphQLContext = {
      userId: 'user-1',
      role: 'ADMIN',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteAllUser({}, { confirmation: 'yes' }, context);

    expect(mockDeleteAllUser).toHaveBeenCalledWith('user-1', 'ADMIN', 'yes');
    expect(result).toBe(2);
  });
});
