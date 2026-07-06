import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockUpdateUser, mockThrowCustomError } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockThrowCustomError: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    updateUser: mockUpdateUser,
  },
}));

vi.mock('@/lib/validation/throwCustomError', () => ({
  throwCustomError: mockThrowCustomError,
}));

import { updateUser } from './updateUser';

describe('updateUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized error when no user is authenticated', async () => {
    mockThrowCustomError.mockReturnValue('unauthorized');

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await updateUser({}, { userUpdateInput: {} }, context);

    expect(mockThrowCustomError).toHaveBeenCalled();
    expect(result).toBe('unauthorized');
  });

  it('delegates profile updates to the user service', async () => {
    mockUpdateUser.mockResolvedValue({ id: 'user-1' });

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await updateUser(
      {},
      { userUpdateInput: { firstName: 'Ada' } },
      context,
    );

    expect(mockUpdateUser).toHaveBeenCalledWith('user-1', { firstName: 'Ada' });
    expect(result).toEqual({ id: 'user-1' });
  });
});
