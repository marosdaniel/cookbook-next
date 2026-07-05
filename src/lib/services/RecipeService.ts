import type { Prisma } from '@prisma/client';
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
import { resolveQueryLimit } from '@/lib/graphql/protection';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';

export interface RecipeFilterInput {
  title?: string;
  categoryKey?: string;
  difficultyLevelKey?: string;
  labelKeys?: string[];
  maxCookingTime?: number;
}

function buildWhereClause(filter?: RecipeFilterInput): Prisma.RecipeWhereInput {
  const where: Prisma.RecipeWhereInput = {};
  if (!filter) return where;

  if (filter.title) {
    where.title = { contains: filter.title, mode: 'insensitive' };
  }
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

async function setCachedData(key: string, value: unknown, ttl: number = DETAIL_CACHE_TTL_SECONDS) {
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

export const RecipeService = {
  // Queries
  async getRecipes(limit?: number, filter?: RecipeFilterInput) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = `recipes:${normalizedLimit || 'all'}:${JSON.stringify(filter || {})}`;

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const where = buildWhereClause(filter);

    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { ingredients: true, preparationSteps: true },
        orderBy: { createdAt: 'desc' },
        ...(normalizedLimit ? { take: normalizedLimit } : {}),
      }),
      prisma.recipe.count({ where }),
    ]);

    const result = { recipes, totalRecipes };

    await setCachedData(cacheKey, result, LIST_CACHE_TTL_SECONDS);

    return result;
  },

  async getRecipeById(id: string) {
    const cacheKey = `recipe:${id}`;

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

  async getRecipesByUserId(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = `recipes:user:${userId}:${normalizedLimit || 'all'}`;

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
    await invalidateCache([
      `recipes:user:${userId}:all`,
      // For general list, we might want to delete the 'all' key
      `recipes:all:{}`,
    ]);

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
      `recipe:${recipeId}`,
      `recipes:user:${userId}:all`,
      `recipes:all:{}`,
    ]);

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

    await invalidateCache([`recipe:${recipeId}`, `recipes:all:{}`]);

    return !!deletedRecipe;
  },

  async rateRecipe(userId: string, ratingInput: RatingInput) {
    if (!Number.isFinite(ratingInput.ratingValue) || ratingInput.ratingValue < 1 || ratingInput.ratingValue > 5) {
      return throwCustomError('Rating must be between 1 and 5', ErrorTypes.BAD_REQUEST);
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
