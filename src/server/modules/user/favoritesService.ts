import { cacheKeys } from '@/lib/cache/cacheKeys';
import { redis } from '@/lib/redis/redis';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { RecipeDomainItem } from '@/server/modules/recipe/types';
import {
  type DomainError,
  type DomainSuccess,
  domainBadRequest,
  domainForbidden,
  domainNotFound,
  err,
  ok,
  type Result,
} from '@/server/platform/errors';
import { resolveQueryLimit } from '@/server/platform/pagination';
import { UserRepository } from './repository';

export const FavoritesService = {
  async getFavoriteRecipes(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userFavorites(userId, normalizedLimit);

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached as RecipeDomainItem[];
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const user = await UserRepository.findWithFavoriteRecipes(
      userId,
      normalizedLimit,
    );
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, user.favoriteRecipes);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return user.favoriteRecipes;
  },

  async addToFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return err(
        domainForbidden(
          'UNAUTHORIZED',
          'Unauthorized operation - insufficient permissions',
        ),
      );
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const recipe = await UserRepository.findRecipeById(recipeId);
    if (!recipe) {
      return err(domainNotFound('RECIPE_NOT_FOUND', 'Recipe not found'));
    }

    const alreadyFavorite = await UserRepository.hasFavoriteRecipe(
      targetUserId,
      recipeId,
    );

    if (alreadyFavorite) {
      return err(
        domainBadRequest('ALREADY_FAVORITE', 'Recipe already in favorites'),
      );
    }

    await UserRepository.connectFavoriteRecipe(targetUserId, recipeId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFavorites(targetUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'SUCCESS',
      message: 'Recipe successfully added to favorites',
      statusCode: 200,
    });
  },

  async removeFromFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return err(
        domainForbidden(
          'UNAUTHORIZED',
          'Unauthorized operation - insufficient permissions',
        ),
      );
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const recipe = await UserRepository.findRecipeById(recipeId);
    if (!recipe) {
      return err(domainNotFound('RECIPE_NOT_FOUND', 'Recipe not found'));
    }

    const alreadyFavorite = await UserRepository.hasFavoriteRecipe(
      targetUserId,
      recipeId,
    );

    if (!alreadyFavorite) {
      return err(
        domainBadRequest('NOT_IN_FAVORITES', 'Recipe not in favorites'),
      );
    }

    await UserRepository.disconnectFavoriteRecipe(targetUserId, recipeId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFavorites(targetUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'SUCCESS',
      message: 'Recipe successfully removed from favorites',
      statusCode: 200,
    });
  },
};
