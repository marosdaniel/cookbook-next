import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUserRepository, mockInvalidateCacheScope } = vi.hoisted(() => ({
  mockUserRepository: {
    findFollowingAndCount: vi.fn(),
    findById: vi.fn(),
    findFollow: vi.fn(),
    createFollow: vi.fn(),
    deleteFollow: vi.fn(),
  },
  mockInvalidateCacheScope: vi.fn(),
}));

vi.mock('./repository', () => ({ UserRepository: mockUserRepository }));

vi.mock('@/server/platform/cache', () => ({
  cached: vi.fn(async ({ load }: { load: () => Promise<unknown> }) => load()),
  cacheKeys: { userFollowing: (userId: string) => `following:${userId}` },
  DETAIL_CACHE_TTL_SECONDS: 60,
  invalidateCacheScope: mockInvalidateCacheScope,
}));

import { FollowService } from './followService';

const FOLLOWER_ID = 'user-1';
const TARGET_ID = 'user-2';

const followRow = (id: string, recipes: number, createdAt: Date) => ({
  createdAt,
  following: {
    id,
    firstName: 'First',
    lastName: 'Last',
    userName: `user_${id}`,
    _count: { recipes },
    recipes: [{ id: `${id}-recipe` }],
  },
});

describe('FollowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFollowing', () => {
    it('maps follow rows into the public shape', async () => {
      const followedAt = new Date('2026-01-01T00:00:00Z');
      mockUserRepository.findFollowingAndCount.mockResolvedValue([
        [followRow('a', 3, followedAt)],
        1,
      ]);

      const result = await FollowService.getFollowing(FOLLOWER_ID);

      expect(result).toEqual({
        totalFollowing: 1,
        users: [
          {
            id: 'a',
            firstName: 'First',
            lastName: 'Last',
            userName: 'user_a',
            recipeCount: 3,
            followedAt,
            latestRecipes: [{ id: 'a-recipe' }],
          },
        ],
      });
    });

    it('applies the requested limit to users but keeps totalFollowing', async () => {
      const date = new Date('2026-01-01T00:00:00Z');
      mockUserRepository.findFollowingAndCount.mockResolvedValue([
        [
          followRow('a', 1, date),
          followRow('b', 1, date),
          followRow('c', 1, date),
        ],
        3,
      ]);

      const result = await FollowService.getFollowing(FOLLOWER_ID, 2);

      expect(result.users.map((u) => u.id)).toEqual(['a', 'b']);
      expect(result.totalFollowing).toBe(3);
    });
  });

  describe('followUser', () => {
    it('creates the follow and invalidates the follower cache', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: TARGET_ID });
      mockUserRepository.findFollow.mockResolvedValue(null);

      const result = await FollowService.followUser(FOLLOWER_ID, TARGET_ID);

      expect(result.isOk()).toBe(true);
      expect(mockUserRepository.createFollow).toHaveBeenCalledWith(
        FOLLOWER_ID,
        TARGET_ID,
      );
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        followerUserId: FOLLOWER_ID,
      });
    });

    it('rejects following yourself without touching the repository', async () => {
      const result = await FollowService.followUser(FOLLOWER_ID, FOLLOWER_ID);

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'BAD_REQUEST',
        reason: 'CANNOT_FOLLOW_SELF',
      });
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('returns USER_NOT_FOUND when the target does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await FollowService.followUser(FOLLOWER_ID, TARGET_ID);

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'NOT_FOUND',
        reason: 'USER_NOT_FOUND',
      });
      expect(mockUserRepository.createFollow).not.toHaveBeenCalled();
    });

    it('returns ALREADY_FOLLOWING when a follow already exists', async () => {
      mockUserRepository.findById.mockResolvedValue({ id: TARGET_ID });
      mockUserRepository.findFollow.mockResolvedValue({ id: 'f-1' });

      const result = await FollowService.followUser(FOLLOWER_ID, TARGET_ID);

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'BAD_REQUEST',
        reason: 'ALREADY_FOLLOWING',
      });
      expect(mockUserRepository.createFollow).not.toHaveBeenCalled();
      expect(mockInvalidateCacheScope).not.toHaveBeenCalled();
    });
  });

  describe('unfollowUser', () => {
    it('deletes the follow and invalidates the follower cache', async () => {
      mockUserRepository.findFollow.mockResolvedValue({ id: 'f-1' });

      const result = await FollowService.unfollowUser(FOLLOWER_ID, TARGET_ID);

      expect(result.isOk()).toBe(true);
      expect(mockUserRepository.deleteFollow).toHaveBeenCalledWith(
        FOLLOWER_ID,
        TARGET_ID,
      );
      expect(mockInvalidateCacheScope).toHaveBeenCalledWith({
        followerUserId: FOLLOWER_ID,
      });
    });

    it('returns NOT_FOLLOWING when there is no follow to remove', async () => {
      mockUserRepository.findFollow.mockResolvedValue(null);

      const result = await FollowService.unfollowUser(FOLLOWER_ID, TARGET_ID);

      expect(result._unsafeUnwrapErr()).toMatchObject({
        code: 'BAD_REQUEST',
        reason: 'NOT_FOLLOWING',
      });
      expect(mockUserRepository.deleteFollow).not.toHaveBeenCalled();
    });
  });
});
