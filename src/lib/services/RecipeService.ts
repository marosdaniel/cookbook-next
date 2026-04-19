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

    return { recipes, totalRecipes };
  },

  async getRecipeById(id: string) {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true, author: true },
    });

    if (!existingRecipe) {
      return throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    return existingRecipe;
  },

  async getRecipesByUserId(userId: string, limit?: number) {
    const [recipes, totalRecipes] = await Promise.all([
      prisma.recipe.findMany({
        where: { createdBy: userId },
        include: { ingredients: true, preparationSteps: true, author: true },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
      }),
      prisma.recipe.count({ where: { createdBy: userId } }),
    ]);

    return { recipes, totalRecipes };
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

    return prisma.recipe.findUnique({
      where: { id: ratingInput.recipeId },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  async deleteRating(userId: string, recipeId: string) {
    try {
      const deleted = await prisma.rating.delete({
        where: { recipeId_userId: { recipeId, userId } },
      });
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
