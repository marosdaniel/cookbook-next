import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GraphQLContext } from '@/types/graphql/context';

const { mockGetFollowing } = vi.hoisted(() => ({
  mockGetFollowing: vi.fn(),
}));

vi.mock('@/lib/services/UserService', () => ({
  UserService: {
    getFollowing: mockGetFollowing,
  },
}));

import { getFollowing } from './getFollowing';

describe('getFollowing resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates following queries to the user service', async () => {
    mockGetFollowing.mockResolvedValue([]);

    const context: GraphQLContext = {
      userId: 'user-1',
      prisma: {} as GraphQLContext['prisma'],
      loaders: {} as GraphQLContext['loaders'],
    };

    const result = await getFollowing({}, { limit: 5 }, context);

    expect(mockGetFollowing).toHaveBeenCalledWith('user-1', 5);
    expect(result).toEqual([]);
  });
});
