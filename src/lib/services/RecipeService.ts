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
import {
  decodeCreatedAtCursor,
  decodeSearchScoreCursor,
  encodeCreatedAtCursor,
  encodeSearchScoreCursor,
} from '@/server/modules/recipe/search';
import type {
  NormalizedRecipeInput,
  RatingDomainInput,
} from '@/server/modules/recipe/types';
import {
  cached,
  cacheKeys,
  DETAIL_CACHE_TTL_SECONDS,
  getCachedValue,
  getRecipeListVersion,
  invalidateCacheScope,
  LIST_CACHE_TTL_SECONDS,
  setCachedValue,
} from '@/server/platform/cache';
import { resolveQueryLimit } from '@/server/platform/pagination';

export type { RecipeFilterInput };

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

type RecipeListResult = {
  recipes: RecipeListItem[];
  totalRecipes: number;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

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

    const cachedList = await getCachedValue<RecipeListResult>(cacheKey);
    if (cachedList) return cachedList;

    const searchTerm = (filter?.search ?? filter?.title)?.trim();

    if (searchTerm) {
      const searchCursor = decodeSearchScoreCursor(after);
      const rows = await RecipeRepository.searchPaginatedByTrigram({
        searchTerm,
        filter,
        cursor: searchCursor,
        take: normalizedLimit ? normalizedLimit + 1 : undefined,
      });

      if (rows.length === 0) {
        return {
          recipes: [],
          totalRecipes: 0,
          pageInfo: { hasNextPage: false, endCursor: null },
        };
      }

      const totalRecipes = Number(rows[0]?.totalCount ?? rows.length);
      const hasNextPage = Boolean(
        normalizedLimit && rows.length > normalizedLimit,
      );
      const pageRows = hasNextPage ? rows.slice(0, normalizedLimit) : rows;
      const pageRecipes = await RecipeRepository.findManyListByIds(
        pageRows.map((row) => row.id),
      );
      const lastRow = pageRows.at(-1);

      const searchResult: RecipeListResult = {
        recipes: pageRecipes,
        totalRecipes,
        pageInfo: {
          hasNextPage,
          endCursor: lastRow
            ? encodeSearchScoreCursor({
                score: Number(lastRow.score),
                id: lastRow.id,
              })
            : null,
        },
      };

      await setCachedValue(cacheKey, searchResult, LIST_CACHE_TTL_SECONDS);
      return searchResult;
    }

    const cursor = decodeCreatedAtCursor(after);
    const where = buildWhereClause(filter);
    if (cursor) {
      where.OR = [
        { createdAt: { lt: new Date(cursor.createdAt) } },
        { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
      ];
    }

    const [recipes, totalRecipes] = await RecipeRepository.findManyListAndCount(
      {
        where,
        countWhere: buildWhereClause(filter),
        take: normalizedLimit ? normalizedLimit + 1 : undefined,
      },
    );

    const hasNextPage = Boolean(
      normalizedLimit && recipes.length > normalizedLimit,
    );
    const pageRecipes = hasNextPage
      ? recipes.slice(0, normalizedLimit)
      : recipes;
    const lastRecipe = pageRecipes.at(-1);
    const result = {
      recipes: pageRecipes,
      totalRecipes,
      pageInfo: {
        hasNextPage,
        endCursor: lastRecipe ? encodeCreatedAtCursor(lastRecipe) : null,
      },
    };

    await setCachedValue(cacheKey, result, LIST_CACHE_TTL_SECONDS);

    return result;
  },

  async getRecipeById(id: string) {
    const cacheKey = cacheKeys.recipeDetail(id);

    const cachedRecipe = await getCachedValue<RecipeWithRelations>(cacheKey);
    if (cachedRecipe) return cachedRecipe;

    const existingRecipe = await RecipeRepository.findByIdWithRelations(id);

    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedValue(cacheKey, existingRecipe, DETAIL_CACHE_TTL_SECONDS);

    return existingRecipe;
  },

  // Resolves either a slug (preferred, SEO-friendly) or a raw id — used by the
  // recipe detail route so old id-based links keep working while new links
  // can be slug-based.
  async getRecipeBySlugOrId(idOrSlug: string) {
    const cacheKey = cacheKeys.recipeLookup(idOrSlug);

    const cachedRecipe = await getCachedValue<RecipeWithAuthor>(cacheKey);
    if (cachedRecipe) return cachedRecipe;

    const recipe = await RecipeRepository.findBySlugOrIdWithAuthor(idOrSlug);

    if (!recipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedValue(cacheKey, recipe, DETAIL_CACHE_TTL_SECONDS);

    return recipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userRecipes(userId, normalizedLimit);

    return cached<{
      recipes: RecipeListItem[];
      totalRecipes: number;
    }>({
      key: cacheKey,
      ttlSeconds: LIST_CACHE_TTL_SECONDS,
      load: async () => {
        const [recipes, totalRecipes] =
          await RecipeRepository.findByAuthorIdAndCount(
            userId,
            normalizedLimit,
          );
        return { recipes, totalRecipes };
      },
    });
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

    await invalidateCacheScope({
      authorId: userId,
      invalidateRecipeLists: true,
    });

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

    await invalidateCacheScope({
      recipeId,
      slugs: [existingRecipe.slug, data.slug],
      authorId: existingRecipe.createdBy,
      invalidateRecipeLists: true,
    });

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

    await invalidateCacheScope({
      recipeId,
      slugs: [existingRecipe.slug],
      authorId: existingRecipe.createdBy,
      invalidateRecipeLists: true,
    });

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

    const recipe = await RecipeRepository.findByIdWithRelations(
      ratingInput.recipeId,
    );
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

    await invalidateCacheScope({
      recipeId: ratingInput.recipeId,
      slugs: [recipe.slug],
    });

    return recipe;
  },

  async deleteRating(userId: string, recipeId: string) {
    try {
      const existingRecipe = await RecipeRepository.findById(recipeId);
      const deleted = await RecipeRepository.deleteRating(recipeId, userId);

      if (deleted) {
        await invalidateCacheScope({
          recipeId,
          slugs: [existingRecipe?.slug],
        });
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
