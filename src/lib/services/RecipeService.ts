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

export const RecipeService = {
  // Queries
  async getRecipes(limit?: number, filter?: RecipeFilterInput) {
    const cacheKey = `recipes:${limit || 'all'}:${JSON.stringify(filter || {})}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const where: Prisma.RecipeWhereInput = {};

    if (filter) {
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
    }

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

    if (redis) {
      try {
        // Cache for 60 seconds to provide a quick response for frequent requests while keeping data relatively fresh
        await redis.setex(cacheKey, 60, result);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return result;
  },

  async getRecipeById(id: string) {
    const cacheKey = `recipe:${id}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return cached;
        }
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true, author: true },
    });

    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, existingRecipe);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return existingRecipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const cacheKey = `recipes:user:${userId}:${limit || 'all'}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

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

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, result);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

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

    if (redis) {
      try {
        // Invalidate user's recipe list and the general recipes list
        // Since list keys depend on filters, we can't easily delete all variations without scanning,
        // but we can at least target the main ones we know.
        await Promise.all([
          redis.del(`recipes:user:${userId}:all`),
          // For general list, we might want to delete the 'all' key
          redis.del(`recipes:all:{}`),
        ]);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

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

    if (redis) {
      try {
        await Promise.all([
          redis.del(`recipe:${recipeId}`),
          redis.del(`recipes:user:${userId}:all`),
          redis.del(`recipes:all:{}`),
        ]);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

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

    if (redis) {
      try {
        await redis.del(`recipe:${ratingInput.recipeId}`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return updatedRecipe;
  },

  async deleteRating(userId: string, recipeId: string) {
    try {
      const deleted = await prisma.rating.delete({
        where: { recipeId_userId: { recipeId, userId } },
      });

      if (redis && deleted) {
        try {
          await redis.del(`recipe:${recipeId}`);
        } catch (err) {
          console.error('Redis cache invalidation error:', err);
        }
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
