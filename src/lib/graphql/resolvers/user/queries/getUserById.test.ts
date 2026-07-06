import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockGetUserById } = vi.hoisted(() => ({
  mockGetUserById: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    getUserById: mockGetUserById,
  },
}));

import { getUserById } from './getUserById';

describe('getUserById resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates a user lookup to the user service', async () => {
    mockGetUserById.mockResolvedValue({ id: 'user-1' });

    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await getUserById({}, { id: 'user-1' }, context);

    expect(mockGetUserById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'user-1' });
  });
});
