import type { Prisma } from '@prisma/client';
import type {
  RatingInput,
  RecipeCreateInput,
  RecipeEditInput,
} from '@/lib/graphql/resolvers/recipe/types';
import {
  buildRecipeData,
  resolveRecipeMetadata,
  validateRequiredFields,
} from '@/lib/graphql/resolvers/recipe/utils';
import { prisma } from '@/lib/prisma/prisma';
import { redis } from '@/lib/redis/redis';
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
    console.error('Redis cache get error:', error);
  }
  return null;
}

async function setCachedData(key: string, value: unknown, ttl: number = 60) {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, value);
  } catch (error) {
    console.error('Redis cache set error:', error);
  }
}

async function invalidateCache(keys: string[]) {
  const currentRedis = redis;
  if (!currentRedis) return;
  try {
    await Promise.all(keys.map((key) => currentRedis.del(key)));
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
}

export const RecipeService = {
  // Queries
  async getRecipes(limit?: number, filter?: RecipeFilterInput) {
    const cacheKey = `recipes:${limit || 'all'}:${JSON.stringify(filter || {})}`;

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const where = buildWhereClause(filter);

    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: { ingredients: true, preparationSteps: true, author: true },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
      }),
      prisma.recipe.count({ where }),
    ]);

    const result = { recipes, totalRecipes };

    // Cache for 60 seconds to provide a quick response for frequent requests while keeping data relatively fresh
    await setCachedData(cacheKey, result, 60);

    return result;
  },

  async getRecipeById(id: string) {
    const cacheKey = `recipe:${id}`;

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true, author: true },
    });

    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    await setCachedData(cacheKey, existingRecipe, 60);

    return existingRecipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const cacheKey = `recipes:user:${userId}:${limit || 'all'}`;

    const cached = await getCachedData(cacheKey);
    if (cached) return cached;

    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where: { createdBy: userId },
        include: { ingredients: true, preparationSteps: true, author: true },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
      }),
      prisma.recipe.count({ where: { createdBy: userId } }),
    ]);

    const result = { recipes, totalRecipes };

    await setCachedData(cacheKey, result, 60);

    return result;
  },

  // Mutations
  async createRecipe(userId: string, recipeCreateInput: RecipeCreateInput) {
    validateRequiredFields(recipeCreateInput);

    const metadata = await resolveRecipeMetadata(recipeCreateInput);
    const data = buildRecipeData(recipeCreateInput, metadata);

    const newRecipe = await prisma.recipe.create({
      data: {
        ...data,
        createdBy: userId,
        ingredients: {
          create: recipeCreateInput.ingredients.map((i) => ({
            localId: i.localId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: i.isOptional ?? false,
            note: i.note ?? null,
          })),
        },
        preparationSteps: {
          create: recipeCreateInput.preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true, author: true },
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
    recipeId: string,
    recipeEditInput: RecipeEditInput,
  ) {
    validateRequiredFields(recipeEditInput);

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });
    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    if (existingRecipe.createdBy !== userId) {
      return throwCustomError(
        'Not authorized to edit this recipe',
        ErrorTypes.FORBIDDEN,
      );
    }

    const metadata = await resolveRecipeMetadata(recipeEditInput);
    const data = buildRecipeData(recipeEditInput, metadata);

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...data,
        ingredients: {
          deleteMany: {},
          create: recipeEditInput.ingredients.map((i) => ({
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
          create: recipeEditInput.preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true, author: true },
    });

    await invalidateCache([
      `recipe:${recipeId}`,
      `recipes:user:${userId}:all`,
      `recipes:all:{}`,
    ]);

    return updatedRecipe;
  },

  async rateRecipe(userId: string, ratingInput: RatingInput) {
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
