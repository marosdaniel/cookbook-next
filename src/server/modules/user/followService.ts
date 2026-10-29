import { cacheKeys } from '@/lib/cache/cacheKeys';
import { redis } from '@/lib/redis/redis';
import {
  type DomainError,
  type DomainSuccess,
  domainBadRequest,
  domainNotFound,
  err,
  ok,
  type Result,
} from '@/server/platform/errors';
import { resolveQueryLimit } from '@/server/platform/pagination';
import { UserRepository } from './repository';
import type { FollowingDomainResult } from './types';

export const FollowService = {
  async getFollowing(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userFollowing(userId, normalizedLimit);

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached as FollowingDomainResult;
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const [follows, totalFollowing] =
      await UserRepository.findFollowingAndCount(userId, normalizedLimit);

    const users = follows.map((follow) => ({
      id: follow.following.id,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      userName: follow.following.userName,
      recipeCount: follow.following._count.recipes,
      followedAt: follow.createdAt,
      latestRecipes: follow.following.recipes,
    }));

    const result = { users, totalFollowing };

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, result);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return result;
  },

  async followUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId === targetUserId) {
      return err(
        domainBadRequest('CANNOT_FOLLOW_SELF', 'You cannot follow yourself'),
      );
    }

    const targetUser = await UserRepository.findById(targetUserId);
    if (!targetUser) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const existingFollow = await UserRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (existingFollow) {
      return err(
        domainBadRequest('ALREADY_FOLLOWING', 'Already following this user'),
      );
    }

    await UserRepository.createFollow(currentUserId, targetUserId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFollowing(currentUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'FOLLOW_SUCCESS',
      message: 'Successfully followed user',
      statusCode: 200,
    });
  },

  async unfollowUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    const existingFollow = await UserRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (!existingFollow) {
      return err(
        domainBadRequest('NOT_FOLLOWING', 'You are not following this user'),
      );
    }

    await UserRepository.deleteFollow(currentUserId, targetUserId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFollowing(currentUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'UNFOLLOW_SUCCESS',
      message: 'Successfully unfollowed user',
      statusCode: 200,
    });
  },
};
