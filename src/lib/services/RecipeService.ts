import type { Prisma } from '@prisma/client';
import { cacheKeys } from '@/lib/cache/cacheKeys';
import { resolveQueryLimit } from '@/lib/graphql/protection';
import type {
  RatingInput,
  RecipeCreateInput,
  RecipeEditInput,
} from '@/lib/graphql/resolvers/recipe/types';
import {
  buildRecipeData,
  resolveRecipeMetadata,
  sanitizeRecipeInput,
  validateRequiredFields,
} from '@/lib/graphql/resolvers/recipe/utils';
import { prisma } from '@/lib/prisma/prisma';
import { redis } from '@/lib/redis/redis';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';

export interface RecipeFilterInput {
  search?: string;
  title?: string;
  categoryKey?: string;
  difficultyLevelKey?: string;
  labelKeys?: string[];
  maxCookingTime?: number;
}

function buildWhereClause(filter?: RecipeFilterInput): Prisma.RecipeWhereInput {
  const where: Prisma.RecipeWhereInput = {};
  if (!filter) return where;

  if (filter.categoryKey) {
    where.category = { path: ['key'], equals: filter.categoryKey };
  }
  if (filter.difficultyLevelKey) {
    where.difficultyLevel = {
      path: ['key'],
      equals: filter.difficultyLevelKey,
    };
  }
  if (filter.labelKeys && filter.labelKeys.length > 0) {
    where.labels = {
      array_contains: filter.labelKeys.map((key) => ({ key })),
    };
  }
  if (filter.maxCookingTime) {
    where.cookingTime = { lte: filter.maxCookingTime };
  }

  return where;
}

type RecipeCursor = { createdAt: string; id: string };

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

async function getCachedData(key: string) {
  if (!redis) return null;
  try {
    const cached = await redis.get(key);
    if (cached) return cached;
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
  const cachedVersion = await getCachedData(cacheKeys.recipeListVersion);
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

  const conflict = await prisma.recipe.findFirst({
    where: {
      slug: { equals: slug, mode: 'insensitive' },
      ...(excludeRecipeId ? { id: { not: excludeRecipeId } } : {}),
    },
    select: { id: true },
  });

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

    const cached = await getCachedData(cacheKey);
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
      const matches = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT r.id
        FROM recipes r
        LEFT JOIN ingredients i ON i."recipeId" = r.id
        WHERE r.title % ${searchTerm}
           OR COALESCE(r.description, '') % ${searchTerm}
           OR COALESCE(r.tips, '') % ${searchTerm}
           OR COALESCE(r.substitutions, '') % ${searchTerm}
           OR COALESCE(i.name, '') % ${searchTerm}
        GROUP BY r.id
        ORDER BY MAX(GREATEST(
          similarity(r.title, ${searchTerm}),
          similarity(COALESCE(r.description, ''), ${searchTerm}),
          similarity(COALESCE(i.name, ''), ${searchTerm})
        )) DESC
      `;
      searchIds = matches.map(({ id }) => id);
      if (searchIds.length === 0) {
        return {
          recipes: [],
          totalRecipes: 0,
          pageInfo: { hasNextPage: false, endCursor: null },
        };
      }
      where.id = { in: searchIds };
    }

    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { ingredients: true, preparationSteps: true },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...(normalizedLimit && !searchIds ? { take: normalizedLimit + 1 } : {}),
      }),
      prisma.recipe.count({
        where: {
          ...buildWhereClause(filter),
          ...(searchIds ? { id: { in: searchIds } } : {}),
        },
      }),
    ]);

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

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true },
    });

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

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const recipe = await prisma.recipe.findFirst({
      where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
      include: { ingredients: true, preparationSteps: true },
    });

    if (!recipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedData(cacheKey, recipe, DETAIL_CACHE_TTL_SECONDS);

    return recipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userRecipes(userId, normalizedLimit);

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where: { createdBy: userId },
        include: { ingredients: true, preparationSteps: true },
        orderBy: { createdAt: 'desc' },
        ...(normalizedLimit ? { take: normalizedLimit } : {}),
      }),
      prisma.recipe.count({ where: { createdBy: userId } }),
    ]);

    const result = { recipes, totalRecipes };

    await setCachedData(cacheKey, result, LIST_CACHE_TTL_SECONDS);

    return result;
  },

  // Mutations
  async createRecipe(userId: string, recipeCreateInput: RecipeCreateInput) {
    const sanitizedInput = sanitizeRecipeInput(recipeCreateInput);
    validateRequiredFields(sanitizedInput);

    const metadata = await resolveRecipeMetadata(sanitizedInput);
    const data = buildRecipeData(sanitizedInput, metadata);

    await assertSlugAvailable(data.slug);

    const newRecipe = await prisma.recipe.create({
      data: {
        ...data,
        createdBy: userId,
        ingredients: {
          create: sanitizedInput.ingredients.map((i) => ({
            localId: i.localId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: i.isOptional ?? false,
            note: i.note ?? null,
          })),
        },
        preparationSteps: {
          create: sanitizedInput.preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });

    // Invalidate user's recipe list and the general recipes list
    // Since list keys depend on filters, we can't easily delete all variations without scanning,
    // but we can at least target the main ones we know.
    await invalidateCache([cacheKeys.userRecipes(userId, undefined)]);
    await invalidateRecipeLists();

    return newRecipe;
  },

  async editRecipe(
    userId: string,
    userRole: string | undefined,
    recipeId: string,
    recipeEditInput: RecipeEditInput,
  ) {
    const sanitizedInput = sanitizeRecipeInput(recipeEditInput);
    validateRequiredFields(sanitizedInput);

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    assertRecipeResourceAccess(userId, userRole, existingRecipe);

    const metadata = await resolveRecipeMetadata(sanitizedInput);
    const data = buildRecipeData(sanitizedInput, metadata);

    await assertSlugAvailable(data.slug, recipeId);

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...data,
        ingredients: {
          deleteMany: {},
          create: sanitizedInput.ingredients.map((i) => ({
            localId: i.localId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: i.isOptional ?? false,
            note: i.note ?? null,
          })),
        },
        preparationSteps: {
          deleteMany: {},
          create: sanitizedInput.preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });

    await invalidateCache([
      cacheKeys.recipeDetail(recipeId),
      cacheKeys.recipeLookup(recipeId),
      ...(existingRecipe.slug
        ? [cacheKeys.recipeLookup(existingRecipe.slug)]
        : []),
      ...(data.slug ? [cacheKeys.recipeLookup(data.slug)] : []),
      cacheKeys.userRecipes(userId, undefined),
    ]);
    await invalidateRecipeLists();

    return updatedRecipe;
  },

  async deleteRecipe(
    userId: string,
    userRole: string | undefined,
    recipeId: string,
  ) {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    assertRecipeResourceAccess(userId, userRole, existingRecipe);

    const deletedRecipe = await prisma.recipe.delete({
      where: { id: recipeId },
    });

    await invalidateCache([
      cacheKeys.recipeDetail(recipeId),
      cacheKeys.recipeLookup(recipeId),
      ...(existingRecipe.slug
        ? [cacheKeys.recipeLookup(existingRecipe.slug)]
        : []),
    ]);
    await invalidateRecipeLists();

    return !!deletedRecipe;
  },

  async rateRecipe(userId: string, ratingInput: RatingInput) {
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

    const recipe = await prisma.recipe.findUnique({
      where: { id: ratingInput.recipeId },
    });
    if (!recipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await prisma.rating.upsert({
      where: {
        recipeId_userId: { recipeId: ratingInput.recipeId, userId: userId },
      },
      update: { ratingValue: ratingInput.ratingValue },
      create: {
        recipeId: ratingInput.recipeId,
        userId: userId,
        ratingValue: ratingInput.ratingValue,
      },
    });

    const updatedRecipe = await prisma.recipe.findUnique({
      where: { id: ratingInput.recipeId },
      include: { ingredients: true, preparationSteps: true },
    });

    await invalidateCache([`recipe:${ratingInput.recipeId}`]);

    return updatedRecipe;
  },

  async deleteRating(userId: string, recipeId: string) {
    try {
      const deleted = await prisma.rating.delete({
        where: { recipeId_userId: { recipeId, userId } },
      });

      if (deleted) {
        await invalidateCache([`recipe:${recipeId}`]);
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
