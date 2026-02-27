import type { Metadata } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

import type { RecipeInputBase } from './types';

/* ─── Assertion Helper ───────────────────────── */

type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];

export function assertPresent<T>(
  value: T,
  message: string,
  errorType: ErrorType,
): asserts value is NonNullable<T> {
  if (value == null) {
    throwCustomError(message, errorType);
  }
}

/* ─── Auth Guard ─────────────────────────────── */

export async function resolveAuthenticatedUser(context: GraphQLContext) {
  if (!context.userId) {
    throwCustomError('Unauthenticated', ErrorTypes.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
  });

  assertPresent(user, 'User not found', ErrorTypes.UNAUTHORIZED);

  return user;
}

/* ─── Input Validation ───────────────────────── */

export function validateRequiredFields(input: RecipeInputBase) {
  const {
    title,
    ingredients,
    preparationSteps,
    category,
    cookingTime,
    difficultyLevel,
    servings,
  } = input;

  if (
    !title ||
    !ingredients ||
    !preparationSteps ||
    !category ||
    !cookingTime ||
    !difficultyLevel ||
    !servings
  ) {
    throwCustomError(
      'All required fields must be provided',
      ErrorTypes.BAD_REQUEST,
    );
  }
}

/* ─── Metadata Resolution ────────────────────── */

export async function resolveRecipeMetadata(input: RecipeInputBase) {
  const { category, difficultyLevel, labels } = input;

  const [categoryFromDb, difficultyLevelFromDb] = await Promise.all([
    prisma.metadata.findUnique({ where: { key: category.value } }),
    prisma.metadata.findUnique({ where: { key: difficultyLevel.value } }),
  ]);

  assertPresent(categoryFromDb, 'Invalid category', ErrorTypes.BAD_REQUEST);
  assertPresent(
    difficultyLevelFromDb,
    'Invalid difficulty level',
    ErrorTypes.BAD_REQUEST,
  );

  let labelsFromDb: Metadata[] = [];
  if (labels && labels.length > 0) {
    labelsFromDb = await prisma.metadata.findMany({
      where: { key: { in: labels.map((l) => l.value) } },
    });
  }

  return { categoryFromDb, difficultyLevelFromDb, labelsFromDb };
}

/* ─── Data Mapping ───────────────────────────── */

function mapMetadata(m: Metadata) {
  return { name: m.name, key: m.key, label: m.label, type: m.type, id: m.id };
}

export function buildRecipeData(
  input: RecipeInputBase,
  metadata: Awaited<ReturnType<typeof resolveRecipeMetadata>>,
) {
  const { categoryFromDb, difficultyLevelFromDb, labelsFromDb } = metadata;

  return {
    title: input.title,
    description: input.description,
    ingredients: input.ingredients.map((i) => ({
      localId: i.localId,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    preparationSteps: input.preparationSteps.map((s, index) => ({
      description: s.description,
      order: s.order || index + 1,
    })),
    category: mapMetadata(categoryFromDb),
    difficultyLevel: mapMetadata(difficultyLevelFromDb),
    labels: labelsFromDb.map(mapMetadata),
    imgSrc: input.imgSrc,
    cookingTime: input.cookingTime,
    servings: input.servings,
    youtubeLink: input.youtubeLink,
  };
}
