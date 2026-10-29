import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  cached,
  cacheKeys,
  DETAIL_CACHE_TTL_SECONDS,
  invalidateCacheScope,
} from '@/server/platform/cache';
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

    return cached({
      key: cacheKey,
      ttlSeconds: DETAIL_CACHE_TTL_SECONDS,
      load: async () => {
        const user = await UserRepository.findWithFavoriteRecipes(
          userId,
          normalizedLimit,
        );
        if (!user) {
          return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
        }
        return user.favoriteRecipes;
      },
    });
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

    await invalidateCacheScope({ favoriteUserId: targetUserId });

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

    await invalidateCacheScope({ favoriteUserId: targetUserId });

    return ok({
      reason: 'SUCCESS',
      message: 'Recipe successfully removed from favorites',
      statusCode: 200,
    });
  },
};
