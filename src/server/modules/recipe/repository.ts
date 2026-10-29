import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';
import {
  buildTrigramSearchQuery,
  type SearchScoreCursor,
  type TrigramSearchRow,
} from './search';
import type {
  IngredientDomainInput,
  NormalizablePreparationStep,
} from './types';

export interface RecipeFilterInput {
  search?: string;
  title?: string;
  categoryKey?: string;
  difficultyLevelKey?: string;
  labelKeys?: string[];
  maxCookingTime?: number;
  cuisineKey?: string;
  costLevelKey?: string;
  dietaryFlagKeys?: string[];
  allergenKeys?: string[];
  equipmentKeys?: string[];
}

export function buildWhereClause(
  filter?: RecipeFilterInput,
): Prisma.RecipeWhereInput {
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
  if (filter.cuisineKey) {
    where.cuisine = { path: ['key'], equals: filter.cuisineKey };
  }
  if (filter.costLevelKey) {
    where.costLevel = { path: ['key'], equals: filter.costLevelKey };
  }
  if (filter.labelKeys && filter.labelKeys.length > 0) {
    where.labels = {
      array_contains: filter.labelKeys.map((key) => ({ key })),
    };
  }
  if (filter.dietaryFlagKeys && filter.dietaryFlagKeys.length > 0) {
    where.dietaryFlags = {
      array_contains: filter.dietaryFlagKeys.map((key) => ({ key })),
    };
  }
  if (filter.allergenKeys && filter.allergenKeys.length > 0) {
    where.allergens = {
      array_contains: filter.allergenKeys.map((key) => ({ key })),
    };
  }
  if (filter.equipmentKeys && filter.equipmentKeys.length > 0) {
    where.equipment = {
      array_contains: filter.equipmentKeys.map((key) => ({ key })),
    };
  }
  if (filter.maxCookingTime) {
    where.cookingTime = { lte: filter.maxCookingTime };
  }

  return where;
}

export const RECIPE_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  labels: true,
  imgSrc: true,
  cookingTime: true,
  difficultyLevel: true,
  servings: true,
  youtubeLink: true,
  createdAt: true,
  updatedAt: true,
  prepTimeMinutes: true,
  cookTimeMinutes: true,
  restTimeMinutes: true,
  totalTimeMinutes: true,
  servingUnit: true,
  cuisine: true,
  dietaryFlags: true,
  allergens: true,
  equipment: true,
  costLevel: true,
  tips: true,
  substitutions: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  socialImage: true,
  createdBy: true,
} satisfies Prisma.RecipeSelect;

export type RecipeListItem = Prisma.RecipeGetPayload<{
  select: typeof RECIPE_LIST_SELECT;
}>;
export type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: { ingredients: true; preparationSteps: true };
}>;
export type RecipeWithAuthor = Prisma.RecipeGetPayload<{
  include: {
    ingredients: true;
    preparationSteps: true;
    author: {
      select: { userName: true; firstName: true; lastName: true };
    };
  };
}>;

export const RecipeRepository = {
  async findSlugConflict(slug: string, excludeRecipeId?: string) {
    return prisma.recipe.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        ...(excludeRecipeId ? { id: { not: excludeRecipeId } } : {}),
      },
      select: { id: true },
    });
  },

  async searchPaginatedByTrigram(opts: {
    searchTerm: string;
    filter?: RecipeFilterInput;
    cursor?: SearchScoreCursor | null;
    take?: number;
  }): Promise<TrigramSearchRow[]> {
    const query = buildTrigramSearchQuery(opts);
    return prisma.$queryRaw<TrigramSearchRow[]>(query);
  },

  async findManyListByIds(ids: string[]): Promise<RecipeListItem[]> {
    if (ids.length === 0) return [];
    const items = await prisma.recipe.findMany({
      where: { id: { in: ids } },
      select: RECIPE_LIST_SELECT,
    });
    const byId = new Map(items.map((item) => [item.id, item]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is RecipeListItem => item !== undefined);
  },

  async findManyListAndCount(opts: {
    where: Prisma.RecipeWhereInput;
    countWhere: Prisma.RecipeWhereInput;
    take?: number;
  }) {
    return Promise.all([
      prisma.recipe.findMany({
        where: opts.where,
        select: RECIPE_LIST_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...(opts.take ? { take: opts.take } : {}),
      }),
      prisma.recipe.count({
        where: opts.countWhere,
      }),
    ]);
  },

  async findByIdWithRelations(id: string) {
    return prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  async findById(id: string) {
    return prisma.recipe.findUnique({
      where: { id },
    });
  },

  async findBySlugOrIdWithAuthor(idOrSlug: string) {
    return prisma.recipe.findFirst({
      where: { OR: [{ slug: idOrSlug }, { id: idOrSlug }] },
      include: {
        ingredients: true,
        preparationSteps: true,
        author: {
          select: {
            userName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  async findByAuthorIdAndCount(userId: string, take?: number) {
    return Promise.all([
      prisma.recipe.findMany({
        where: { createdBy: userId },
        select: RECIPE_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        ...(take ? { take } : {}),
      }),
      prisma.recipe.count({ where: { createdBy: userId } }),
    ]);
  },

  async createWithRelations(
    userId: string,
    data: Omit<
      Prisma.RecipeUncheckedCreateInput,
      'createdBy' | 'ingredients' | 'preparationSteps'
    >,
    ingredients: IngredientDomainInput[],
    preparationSteps: NormalizablePreparationStep[],
  ) {
    return prisma.recipe.create({
      data: {
        ...data,
        createdBy: userId,
        ingredients: {
          create: ingredients.map((i) => ({
            localId: i.localId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: i.isOptional ?? false,
            note: i.note ?? null,
          })),
        },
        preparationSteps: {
          create: preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  async updateWithRelations(
    recipeId: string,
    data: Omit<
      Prisma.RecipeUncheckedUpdateInput,
      'ingredients' | 'preparationSteps'
    >,
    ingredients: IngredientDomainInput[],
    preparationSteps: NormalizablePreparationStep[],
  ) {
    return prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ...data,
        ingredients: {
          deleteMany: {},
          create: ingredients.map((i) => ({
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
          create: preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  async deleteById(id: string) {
    return prisma.recipe.delete({
      where: { id },
    });
  },

  async upsertRating(recipeId: string, userId: string, ratingValue: number) {
    return prisma.rating.upsert({
      where: {
        recipeId_userId: { recipeId, userId },
      },
      update: { ratingValue },
      create: {
        recipeId,
        userId,
        ratingValue,
      },
    });
  },

  async deleteRating(recipeId: string, userId: string) {
    return prisma.rating.delete({
      where: { recipeId_userId: { recipeId, userId } },
    });
  },
};
