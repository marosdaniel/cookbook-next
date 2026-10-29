import { cacheKeys } from '@/lib/cache/cacheKeys';
import { redis } from '@/lib/redis/redis';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  buildRecipeData,
  resolveRecipeMetadata,
  sanitizeRecipeInput,
  validateRequiredFields,
} from '@/server/modules/recipe/mapper';
import {
  buildWhereClause,
  type RecipeFilterInput,
  type RecipeListItem,
  RecipeRepository,
  type RecipeWithAuthor,
  type RecipeWithRelations,
} from '@/server/modules/recipe/repository';
import type {
  NormalizedRecipeInput,
  RatingDomainInput,
} from '@/server/modules/recipe/types';
import { resolveQueryLimit } from '@/server/platform/pagination';

export type { RecipeFilterInput };

type RecipeCursor = { createdAt: string; id: string };

type RecipeListResult = {
  recipes: RecipeListItem[];
  totalRecipes: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

const encodeCursor = (cursor: { createdAt: Date; id: string }) =>
  Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    }),
  ).toString('base64url');

const decodeCursor = (cursor: string | undefined): RecipeCursor | null => {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, 'base64url').toString(),
    ) as RecipeCursor;
    if (
      typeof decoded.createdAt !== 'string' ||
      typeof decoded.id !== 'string'
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    if (cached) return cached as T;
  } catch (error) {
    console.warn('Redis cache get error:', error);
  }
  return null;
}

const LIST_CACHE_TTL_SECONDS = 15;
const DETAIL_CACHE_TTL_SECONDS = 60;

async function setCachedData(
  key: string,
  value: unknown,
  ttl: number = DETAIL_CACHE_TTL_SECONDS,
) {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, value);
  } catch (error) {
    console.warn('Redis cache set error:', error);
  }
}

async function invalidateCache(keys: string[]) {
  const currentRedis = redis;
  if (!currentRedis) return;
  try {
    await Promise.all(keys.map((key) => currentRedis.del(key)));
  } catch (error) {
    console.warn('Redis cache invalidation error:', error);
  }
}

async function getRecipeListVersion() {
  const cachedVersion = await getCachedData<number>(
    cacheKeys.recipeListVersion,
  );
  return typeof cachedVersion === 'number' ? cachedVersion : 1;
}

async function invalidateRecipeLists() {
  if (!redis?.incr) return;
  try {
    await redis.incr(cacheKeys.recipeListVersion);
  } catch (error) {
    console.warn('Redis recipe list version invalidation error:', error);
  }
}

export const assertRecipeResourceAccess = (
  userId: string,
  userRole: string | undefined,
  recipe: { createdBy: string },
) => {
  if (userRole === 'ADMIN' || recipe.createdBy === userId) {
    return;
  }

  return throwCustomError(
    'Not authorized to edit this recipe',
    ErrorTypes.FORBIDDEN,
  );
};

async function assertSlugAvailable(
  slug: string | null | undefined,
  excludeRecipeId?: string,
) {
  if (!slug) return;

  const conflict = await RecipeRepository.findSlugConflict(
    slug,
    excludeRecipeId,
  );

  if (conflict) {
    return throwCustomError(
      'This slug is already in use, please choose another one',
      ErrorTypes.CONFLICT,
    );
  }
}

export const RecipeService = {
  // Queries
  async getRecipes(limit?: number, filter?: RecipeFilterInput, after?: string) {
    const normalizedLimit = resolveQueryLimit(limit);
    const version = await getRecipeListVersion();
    const cacheKey = cacheKeys.recipeList(
      version,
      normalizedLimit,
      filter,
      after,
    );

    const cached = await getCachedData<RecipeListResult>(cacheKey);
    if (cached) return cached;

    const cursor = decodeCursor(after);
    const where = buildWhereClause(filter);
    if (cursor) {
      where.OR = [
        { createdAt: { lt: new Date(cursor.createdAt) } },
        { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
      ];
    }

    const searchTerm = (filter?.search ?? filter?.title)?.trim();
    let searchIds: string[] | undefined;
    if (searchTerm) {
      searchIds = await RecipeRepository.searchIdsByTrigram(searchTerm);
      if (searchIds.length === 0) {
        return {
          recipes: [],
          totalRecipes: 0,
          pageInfo: { hasNextPage: false, endCursor: null },
        };
      }
      where.id = { in: searchIds };
    }

    const [recipes, totalRecipes] = await RecipeRepository.findManyListAndCount(
      {
        where,
        countWhere: {
          ...buildWhereClause(filter),
          ...(searchIds ? { id: { in: searchIds } } : {}),
        },
        take: normalizedLimit && !searchIds ? normalizedLimit + 1 : undefined,
      },
    );

    const orderedRecipes = searchIds
      ? [...recipes].sort(
          (left, right) =>
            searchIds.indexOf(left.id) - searchIds.indexOf(right.id),
        )
      : recipes;
    const hasNextPage = Boolean(
      normalizedLimit && orderedRecipes.length > normalizedLimit,
    );
    const pageRecipes = hasNextPage
      ? orderedRecipes.slice(0, normalizedLimit)
      : orderedRecipes;
    const lastRecipe = pageRecipes.at(-1);
    const result = {
      recipes: pageRecipes,
      totalRecipes,
      pageInfo: {
        hasNextPage,
        endCursor: lastRecipe ? encodeCursor(lastRecipe) : null,
      },
    };

    await setCachedData(cacheKey, result, LIST_CACHE_TTL_SECONDS);

    return result;
  },

  async getRecipeById(id: string) {
    const cacheKey = cacheKeys.recipeDetail(id);

    const cached = await getCachedData<RecipeWithRelations>(cacheKey);
    if (cached) return cached;

    const existingRecipe = await RecipeRepository.findByIdWithRelations(id);

    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedData(cacheKey, existingRecipe, DETAIL_CACHE_TTL_SECONDS);

    return existingRecipe;
  },

  // Resolves either a slug (preferred, SEO-friendly) or a raw id — used by the
  // recipe detail route so old id-based links keep working while new links
  // can be slug-based.
  async getRecipeBySlugOrId(idOrSlug: string) {
    const cacheKey = cacheKeys.recipeLookup(idOrSlug);

    const cached = await getCachedData<RecipeWithAuthor>(cacheKey);
    if (cached) return cached;

    const recipe = await RecipeRepository.findBySlugOrIdWithAuthor(idOrSlug);

    if (!recipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedData(cacheKey, recipe, DETAIL_CACHE_TTL_SECONDS);

    return recipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userRecipes(userId, normalizedLimit);

    const cached = await getCachedData<{
      recipes: RecipeListItem[];
      totalRecipes: number;
    }>(cacheKey);
    if (cached) return cached;

    const [recipes, totalRecipes] =
      await RecipeRepository.findByAuthorIdAndCount(userId, normalizedLimit);

    const result = { recipes, totalRecipes };

    await setCachedData(cacheKey, result, LIST_CACHE_TTL_SECONDS);

    return result;
  },

  // Mutations
  async createRecipe(userId: string, recipeCreateInput: NormalizedRecipeInput) {
    const sanitizedInput = sanitizeRecipeInput(recipeCreateInput);
    validateRequiredFields(sanitizedInput);

    const metadata = await resolveRecipeMetadata(sanitizedInput);
    const data = buildRecipeData(sanitizedInput, metadata);

    await assertSlugAvailable(data.slug);

    const newRecipe = await RecipeRepository.createWithRelations(
      userId,
      data,
      sanitizedInput.ingredients,
      sanitizedInput.preparationSteps,
    );

    await invalidateCache([cacheKeys.userRecipes(userId, undefined)]);
    await invalidateRecipeLists();

    return newRecipe;
  },

  async editRecipe(
    userId: string,
    userRole: string | undefined,
    recipeId: string,
    recipeEditInput: NormalizedRecipeInput,
  ) {
    const sanitizedInput = sanitizeRecipeInput(recipeEditInput);
    validateRequiredFields(sanitizedInput);

    const existingRecipe = await RecipeRepository.findById(recipeId);
    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    assertRecipeResourceAccess(userId, userRole, existingRecipe);

    const metadata = await resolveRecipeMetadata(sanitizedInput);
    const data = buildRecipeData(sanitizedInput, metadata);

    await assertSlugAvailable(data.slug, recipeId);

    const updatedRecipe = await RecipeRepository.updateWithRelations(
      recipeId,
      data,
      sanitizedInput.ingredients,
      sanitizedInput.preparationSteps,
    );

    await invalidateCache([
      cacheKeys.recipeDetail(recipeId),
      cacheKeys.recipeLookup(recipeId),
      ...(existingRecipe.slug
        ? [cacheKeys.recipeLookup(existingRecipe.slug)]
        : []),
      ...(data.slug ? [cacheKeys.recipeLookup(data.slug)] : []),
      cacheKeys.userRecipes(existingRecipe.createdBy, undefined),
    ]);
    await invalidateRecipeLists();

    return updatedRecipe;
  },

  async deleteRecipe(
    userId: string,
    userRole: string | undefined,
    recipeId: string,
  ) {
    const existingRecipe = await RecipeRepository.findById(recipeId);
    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    assertRecipeResourceAccess(userId, userRole, existingRecipe);

    const deletedRecipe = await RecipeRepository.deleteById(recipeId);

    await invalidateCache([
      cacheKeys.recipeDetail(recipeId),
      cacheKeys.recipeLookup(recipeId),
      ...(existingRecipe.slug
        ? [cacheKeys.recipeLookup(existingRecipe.slug)]
        : []),
      cacheKeys.userRecipes(existingRecipe.createdBy, undefined),
    ]);
    await invalidateRecipeLists();

    return !!deletedRecipe;
  },

  async rateRecipe(userId: string, ratingInput: RatingDomainInput) {
    if (
      !Number.isFinite(ratingInput.ratingValue) ||
      ratingInput.ratingValue < 1 ||
      ratingInput.ratingValue > 5
    ) {
      return throwCustomError(
        'Rating must be between 1 and 5',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const recipe = await RecipeRepository.findById(ratingInput.recipeId);
    if (!recipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    if (recipe.createdBy === userId) {
      return throwCustomError(
        'You cannot rate your own recipe',
        ErrorTypes.FORBIDDEN,
      );
    }

    await RecipeRepository.upsertRating(
      ratingInput.recipeId,
      userId,
      ratingInput.ratingValue,
    );

    const updatedRecipe = await RecipeRepository.findByIdWithRelations(
      ratingInput.recipeId,
    );

    await invalidateCache([cacheKeys.recipeDetail(ratingInput.recipeId)]);

    return updatedRecipe;
  },

  async deleteRating(userId: string, recipeId: string) {
    try {
      const deleted = await RecipeRepository.deleteRating(recipeId, userId);

      if (deleted) {
        await invalidateCache([cacheKeys.recipeDetail(recipeId)]);
      }

      return !!deleted;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        return false; // Record not found
      }
      throw error;
    }
  },
};
