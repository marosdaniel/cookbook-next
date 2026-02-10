import type { Metadata } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

interface RecipeCreateInput {
  title: string;
  description?: string;
  ingredients: {
    localId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  preparationSteps: { description: string; order: number }[];
  category: { value: string; label: string };
  labels?: { value: string; label: string }[];
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: { value: string; label: string };
  servings: number;
  youtubeLink?: string;
}

export const createRecipe = async (
  _: unknown,
  { recipeCreateInput }: { recipeCreateInput: RecipeCreateInput },
  context: GraphQLContext,
) => {
  if (!context.userId) {
    throwCustomError('Unauthenticated', ErrorTypes.UNAUTHORIZED);
  }

  const {
    title,
    description,
    ingredients,
    preparationSteps,
    category,
    labels,
    imgSrc,
    cookingTime,
    difficultyLevel,
    servings,
    youtubeLink,
  } = recipeCreateInput;

  if (
    !title ||
    !ingredients ||
    !preparationSteps ||
    !category ||
    !cookingTime ||
    !difficultyLevel ||
    !servings
  ) {
    throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: context.userId },
    });

    if (!user) {
      throwCustomError('User not found', ErrorTypes.UNAUTHORIZED);
    }

    // Fetch Metadata
    const categoryFromDb = await prisma.metadata.findFirst({
      where: { key: category.value, type: 'CATEGORY' },
    });

    const difficultyLevelFromDb = await prisma.metadata.findFirst({
      where: { key: difficultyLevel.value, type: 'DIFFICULTY_LEVEL' },
    });

    if (!categoryFromDb || !difficultyLevelFromDb) {
      throwCustomError(
        'Invalid category or difficulty level',
        ErrorTypes.BAD_REQUEST,
      );
      // TS knows this throws, but sometimes we return to satisfy types if function wasn't 'never'
    }

    let labelsFromDb: Metadata[] = [];
    if (labels && labels.length > 0) {
      labelsFromDb = await prisma.metadata.findMany({
        where: {
          key: { in: labels.map((l) => l.value) },
          type: 'LABEL',
        },
      });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        description,
        ingredients: ingredients.map((i) => ({
          localId: i.localId,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        })),
        preparationSteps: preparationSteps.map((s, index) => ({
          description: s.description,
          order: s.order || index + 1,
        })),
        category: {
          name: categoryFromDb?.name,
          key: categoryFromDb?.key,
          label: categoryFromDb?.label,
          type: categoryFromDb?.type,
          id: categoryFromDb?.id,
        },
        difficultyLevel: {
          name: difficultyLevelFromDb?.name,
          key: difficultyLevelFromDb?.key,
          label: difficultyLevelFromDb?.label,
          type: difficultyLevelFromDb?.type,
          id: difficultyLevelFromDb?.id,
        },
        labels: labelsFromDb.map((l) => ({
          name: l.name,
          key: l.key,
          label: l.label,
          type: l.type,
          id: l.id,
        })),
        imgSrc,
        cookingTime,
        servings,
        youtubeLink,
        createdBy: user?.id,
        ratings: { create: [] },
      },
    });

    return newRecipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
};
