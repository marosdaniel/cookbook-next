import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';
import {
  buildTrigramSearchQuery,
  type SearchScoreCursor,
  type TrigramSearchRow,
} from './search';
import {
  type IngredientDomainInput,
  type NormalizablePreparationStep,
  RECIPE_LIST_SELECT,
  type RecipeFilterInput,
} from './types';

export type { RecipeFilterInput };
export { RECIPE_LIST_SELECT };

const toIngredientCreateInputs = (ingredients: IngredientDomainInput[]) =>
  ingredients.map((i) => ({
    localId: i.localId,
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
    isOptional: i.isOptional ?? false,
    note: i.note ?? null,
  }));

const toPreparationStepCreateInputs = (
  preparationSteps: NormalizablePreparationStep[],
) =>
  preparationSteps.map((s, index) => ({
    description: s.description,
    order: s.order || index + 1,
  }));

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
  findSlugConflict(slug: string, excludeRecipeId?: string) {
    return prisma.recipe.findFirst({
      where: {
        slug: { equals: slug, mode: 'insensitive' },
        ...(excludeRecipeId ? { id: { not: excludeRecipeId } } : {}),
      },
      select: { id: true },
    });
  },

  searchPaginatedByTrigram(opts: {
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

  findByIdWithRelations(id: string) {
    return prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  findById(id: string) {
    return prisma.recipe.findUnique({
      where: { id },
    });
  },

  findBySlugOrIdWithAuthor(idOrSlug: string) {
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

  createWithRelations(
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
          create: toIngredientCreateInputs(ingredients),
        },
        preparationSteps: {
          create: toPreparationStepCreateInputs(preparationSteps),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  updateWithRelations(
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
          create: toIngredientCreateInputs(ingredients),
        },
        preparationSteps: {
          deleteMany: {},
          create: toPreparationStepCreateInputs(preparationSteps),
        },
      },
      include: { ingredients: true, preparationSteps: true },
    });
  },

  deleteById(id: string) {
    return prisma.recipe.delete({
      where: { id },
    });
  },

  upsertRating(recipeId: string, userId: string, ratingValue: number) {
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

  deleteRating(recipeId: string, userId: string) {
    return prisma.rating.delete({
      where: { recipeId_userId: { recipeId, userId } },
    });
  },
};
