import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockDeleteUser, mockThrowCustomError } = vi.hoisted(() => ({
  mockDeleteUser: vi.fn(),
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    deleteUser: mockDeleteUser,
  },
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { deleteUser } from './deleteUser';

describe('deleteUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized error when the caller is not authenticated', async () => {
    mockThrowCustomError.mockReturnValue('unauthorized');

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteUser({}, { id: 'target-user' }, context);

    expect(mockThrowCustomError).toHaveBeenCalled();
    expect(result).toBe('unauthorized');
  });

  it('delegates the deletion request to the user service', async () => {
    mockDeleteUser.mockResolvedValue(true);

    const context: GraphQLContext = {
      userId: 'user-1',
      role: 'ADMIN',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await deleteUser({}, { id: 'target-user' }, context);

    expect(mockDeleteUser).toHaveBeenCalledWith(
      'user-1',
      'ADMIN',
      'target-user',
    );
    expect(result).toBe(true);
  });
});
