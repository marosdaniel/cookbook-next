import { METADATA } from '@/lib/data/metadata';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

import type { MetaInputPartial, RecipeInputBase } from './types';

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

/**
 * Since the Metadata model was removed from the database,
 * metadata is now taken directly from input
 * and stored as JSON within the recipe.
 */
export async function resolveRecipeMetadata(input: RecipeInputBase) {
  const { category, difficultyLevel, labels = [] } = input;

  return {
    categoryFromInput: category,
    difficultyLevelFromInput: difficultyLevel,
    labelsFromInput: labels,
  };
}

/* ─── Data Mapping ───────────────────────────── */

function mapMetadataToJson(m: MetaInputPartial, type: string) {
  const existing = METADATA.find(
    (entry) =>
      entry.type === type && (entry.key === m.value || entry.name === m.value),
  );

  return {
    id: existing?.id || null,
    name: m.value,
    key: existing?.key || m.value,
    label: m.label,
    type,
  };
}

export function buildRecipeData(
  input: RecipeInputBase,
  metadata: Awaited<ReturnType<typeof resolveRecipeMetadata>>,
) {
  const { categoryFromInput, difficultyLevelFromInput, labelsFromInput } =
    metadata;

  return {
    title: input.title,
    description: input.description,
    category: mapMetadataToJson(categoryFromInput, 'CATEGORY'),
    difficultyLevel: mapMetadataToJson(
      difficultyLevelFromInput,
      'DIFFICULTY_LEVEL',
    ),
    labels: labelsFromInput.map((l) => mapMetadataToJson(l, 'LABEL')),
    imgSrc: input.imgSrc,
    cookingTime: input.cookingTime,
    servings: input.servings,
    youtubeLink: input.youtubeLink,
  };
}
