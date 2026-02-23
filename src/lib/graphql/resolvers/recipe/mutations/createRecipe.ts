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
  type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];
  type AssertPresent = <T>(
    value: T,
    message: string,
    errorType: ErrorType,
  ) => asserts value is NonNullable<T>;

  const assertPresent: AssertPresent = (value, message, errorType) => {
    if (value == null) {
      throwCustomError(message, errorType);
    }
  };

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

    assertPresent(user, 'User not found', ErrorTypes.UNAUTHORIZED);

    // Fetch Metadata
    const categoryFromDb = await prisma.metadata.findUnique({
      where: { key: category.value },
    });

    const difficultyLevelFromDb = await prisma.metadata.findUnique({
      where: { key: difficultyLevel.value },
    });

    assertPresent(
      categoryFromDb,
      'Invalid category or difficulty level',
      ErrorTypes.BAD_REQUEST,
    );
    assertPresent(
      difficultyLevelFromDb,
      'Invalid category or difficulty level',
      ErrorTypes.BAD_REQUEST,
    );

    let labelsFromDb: Metadata[] = [];
    if (labels && labels.length > 0) {
      labelsFromDb = await prisma.metadata.findMany({
        where: {
          key: { in: labels.map((l) => l.value) },
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
          name: categoryFromDb.name,
          key: categoryFromDb.key,
          label: categoryFromDb.label,
          type: categoryFromDb.type,
          id: categoryFromDb.id,
        },
        difficultyLevel: {
          name: difficultyLevelFromDb.name,
          key: difficultyLevelFromDb.key,
          label: difficultyLevelFromDb.label,
          type: difficultyLevelFromDb.type,
          id: difficultyLevelFromDb.id,
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
        createdBy: user.id,
        ratings: { create: [] },
      },
    });

    return newRecipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
};
