import { Prisma } from '@prisma/client';
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
  const {
    category,
    difficultyLevel,
    labels = [],
    cuisine,
    servingUnit,
    dietaryFlags = [],
    allergens = [],
    equipment = [],
    costLevel,
  } = input;

  return {
    categoryFromInput: category,
    difficultyLevelFromInput: difficultyLevel,
    labelsFromInput: labels,
    cuisineFromInput: cuisine,
    servingUnitFromInput: servingUnit,
    dietaryFlagsFromInput: dietaryFlags,
    allergensFromInput: allergens,
    equipmentFromInput: equipment,
    costLevelFromInput: costLevel,
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
  const {
    categoryFromInput,
    difficultyLevelFromInput,
    labelsFromInput,
    cuisineFromInput,
    servingUnitFromInput,
    dietaryFlagsFromInput,
    allergensFromInput,
    equipmentFromInput,
    costLevelFromInput,
  } = metadata;

  // Compute totalTimeMinutes from time breakdown
  const prep = input.prepTimeMinutes ?? 0;
  const cook = input.cookTimeMinutes ?? 0;
  const rest = input.restTimeMinutes ?? 0;
  const hasTimes =
    input.prepTimeMinutes != null ||
    input.cookTimeMinutes != null ||
    input.restTimeMinutes != null;
  const totalTimeMinutes = hasTimes ? prep + cook + rest : null;

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

    // Time fields
    prepTimeMinutes: input.prepTimeMinutes ?? null,
    cookTimeMinutes: input.cookTimeMinutes ?? null,
    restTimeMinutes: input.restTimeMinutes ?? null,
    totalTimeMinutes,

    // Metadata fields
    servingUnit: servingUnitFromInput
      ? mapMetadataToJson(servingUnitFromInput, 'SERVING_UNIT')
      : Prisma.DbNull,
    cuisine: cuisineFromInput
      ? mapMetadataToJson(cuisineFromInput, 'CUISINE')
      : Prisma.DbNull,
    dietaryFlags: dietaryFlagsFromInput.map((d) =>
      mapMetadataToJson(d, 'DIET'),
    ),
    allergens: allergensFromInput.map((a) => mapMetadataToJson(a, 'ALLERGEN')),
    equipment: equipmentFromInput.map((e) => mapMetadataToJson(e, 'EQUIPMENT')),
    costLevel: costLevelFromInput
      ? mapMetadataToJson(costLevelFromInput, 'COST_LEVEL')
      : Prisma.DbNull,

    // Text fields
    tips: input.tips ?? null,
    substitutions: input.substitutions ?? null,

    // SEO fields
    slug: input.slug ?? null,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    socialImage: input.socialImage ?? null,
  };
}
