import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockFollowUser } = vi.hoisted(() => ({
  mockFollowUser: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    followUser: mockFollowUser,
  },
}));

import { followUser } from './followUser';

describe('followUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized response when no current user is present', async () => {
    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await followUser({}, { targetUserId: 'user-2' }, context);

    expect(result).toEqual({
      success: false,
      message: 'Authentication required',
      messageKey: 'response.userFollowUnauthorized',
      statusCode: 403,
    });
  });

  it('delegates follow requests to the user service', async () => {
    mockFollowUser.mockResolvedValue({
      success: true,
      message: 'ok',
      statusCode: 200,
    });

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await followUser({}, { targetUserId: 'user-2' }, context);

    expect(mockFollowUser).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result).toEqual({ success: true, message: 'ok', statusCode: 200 });
  });
});
