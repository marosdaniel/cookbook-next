import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockUnfollowUser } = vi.hoisted(() => ({
  mockUnfollowUser: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    unfollowUser: mockUnfollowUser,
  },
}));

import { unfollowUser } from './unfollowUser';

describe('unfollowUser resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an unauthorized response when no current user is present', async () => {
    const context: GraphQLContext = {
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await unfollowUser({}, { targetUserId: 'user-2' }, context);

    expect(result).toEqual({
      success: false,
      message: 'Authentication required',
      messageKey: 'response.userFollowUnauthorized',
      statusCode: 403,
    });
  });

  it('delegates unfollow requests to the user service', async () => {
    mockUnfollowUser.mockResolvedValue({
      success: true,
      message: 'ok',
      statusCode: 200,
    });

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await unfollowUser({}, { targetUserId: 'user-2' }, context);

    expect(mockUnfollowUser).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result).toEqual({ success: true, message: 'ok', statusCode: 200 });
  });
});
