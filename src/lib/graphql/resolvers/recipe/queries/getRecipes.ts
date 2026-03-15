import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';

export interface RecipeFilterInput {
  title?: string;
  categoryKey?: string;
  difficultyLevelKey?: string;
  labelKeys?: string[];
  maxCookingTime?: number;
}

export const getRecipes = async (
  _: unknown,
  { limit, filter }: { limit?: number; filter?: RecipeFilterInput },
) => {
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
      include: {
        ingredients: true,
        preparationSteps: true,
        author: true,
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    recipes,
    totalRecipes,
  };
};
