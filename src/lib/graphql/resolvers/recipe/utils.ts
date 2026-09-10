import { Prisma } from '@prisma/client';
import type {
  RecipeCreateInput as GeneratedRecipeCreateInput,
  RecipeEditInput as GeneratedRecipeEditInput,
  MetaInputPartial,
} from '@/lib/graphql/generated/resolvers-types';
import { METADATA_DEFINITIONS } from '@/lib/metadata/definitions';
import { prisma } from '@/lib/prisma/prisma';
import { sanitizeOptional, sanitizeText } from '@/lib/sanitize/sanitize';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

import type {
  NormalizablePreparationStep,
  NormalizedRecipeInput,
} from './types';

/* ─── Assertion Helper ───────────────────────── */

type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];

export const assertPresent: <T>(
  value: T,
  message: string,
  errorType: ErrorType,
) => asserts value is NonNullable<T> = (value, message, errorType) => {
  if (value == null) {
    throwCustomError(message, errorType);
  }
};

/* ─── Auth Guard ─────────────────────────────── */

export const resolveAuthenticatedUser = async (context: GraphQLContext) => {
  if (!context.userId) {
    throwCustomError('Unauthenticated', ErrorTypes.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: context.userId },
  });

  assertPresent(user, 'User not found', ErrorTypes.UNAUTHORIZED);

  return user;
};

/* ─── Input Validation ───────────────────────── */

export const validateRequiredFields = (input: NormalizedRecipeInput) => {
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
};

type GeneratedRecipeInput =
  | GeneratedRecipeCreateInput
  | GeneratedRecipeEditInput;

type NormalizableRecipeInput = Omit<
  GeneratedRecipeInput,
  'preparationSteps'
> & {
  preparationSteps: Array<NormalizablePreparationStep | null | undefined>;
};

export const normalizeRecipeInput = (
  input: NormalizableRecipeInput,
): NormalizedRecipeInput => {
  const ingredients = input.ingredients.map((ingredient, index) => {
    assertPresent(
      ingredient,
      `Ingredient ${index + 1} must be provided`,
      ErrorTypes.BAD_REQUEST,
    );
    return {
      ...ingredient,
      isOptional: ingredient.isOptional ?? undefined,
      note: ingredient.note ?? undefined,
    };
  });

  const preparationSteps = input.preparationSteps.map((step, index) => {
    assertPresent(
      step,
      `Preparation step ${index + 1} must be provided`,
      ErrorTypes.BAD_REQUEST,
    );
    return step;
  });

  const normalizeMetadataList = (
    values: typeof input.labels,
    fieldName: string,
  ): MetaInputPartial[] | undefined => {
    if (!values) return undefined;
    return values.map((value, index) => {
      assertPresent(
        value,
        `${fieldName} item ${index + 1} must be provided`,
        ErrorTypes.BAD_REQUEST,
      );
      return value;
    });
  };

  return {
    title: input.title,
    description: input.description ?? undefined,
    ingredients,
    preparationSteps,
    category: input.category,
    labels: normalizeMetadataList(input.labels, 'Label'),
    imgSrc: input.imgSrc ?? undefined,
    cookingTime: input.cookingTime,
    difficultyLevel: input.difficultyLevel,
    servings: input.servings,
    youtubeLink: input.youtubeLink ?? undefined,
    prepTimeMinutes: input.prepTimeMinutes ?? undefined,
    cookTimeMinutes: input.cookTimeMinutes ?? undefined,
    restTimeMinutes: input.restTimeMinutes ?? undefined,
    servingUnit: input.servingUnit ?? undefined,
    cuisine: input.cuisine ?? undefined,
    dietaryFlags: normalizeMetadataList(input.dietaryFlags, 'Dietary flag'),
    allergens: normalizeMetadataList(input.allergens, 'Allergen'),
    equipment: normalizeMetadataList(input.equipment, 'Equipment'),
    costLevel: input.costLevel ?? undefined,
    tips: input.tips ?? undefined,
    substitutions: input.substitutions ?? undefined,
    slug: input.slug ?? undefined,
    seoTitle: input.seoTitle ?? undefined,
    seoDescription: input.seoDescription ?? undefined,
    socialImage: input.socialImage ?? undefined,
  };
};

/* ─── Metadata Resolution ────────────────────── */

export const resolveRecipeMetadata = async (input: NormalizedRecipeInput) => {
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
};

/* ─── Data Mapping ───────────────────────────── */

const mapMetadataToJson = (m: MetaInputPartial, type: string) => {
  const existing = METADATA_DEFINITIONS.find(
    (entry) => entry.type === type && entry.key === m.value,
  );

  return {
    key: existing?.key || m.value,
    label: existing?.translationKey || m.label,
    type,
  };
};

export const sanitizeRecipeInput = (input: NormalizedRecipeInput) => {
  return {
    ...input,
    ingredients: (input.ingredients ?? []).map((ingredient) => ({
      ...ingredient,
      name: sanitizeText(ingredient.name),
      unit: sanitizeText(ingredient.unit),
      note: ingredient.note ? sanitizeText(ingredient.note) : undefined,
    })),
    preparationSteps: (input.preparationSteps ?? []).map((step) => ({
      ...step,
      description: sanitizeText(step.description),
    })),
  };
};

export const buildRecipeData = (
  input: NormalizedRecipeInput,
  metadata: Awaited<ReturnType<typeof resolveRecipeMetadata>>,
) => {
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
    title: sanitizeText(input.title),
    description: sanitizeOptional(input.description),
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

    // Text fields (sanitized to prevent XSS)
    tips: input.tips ? sanitizeText(input.tips) : null,
    substitutions: input.substitutions
      ? sanitizeText(input.substitutions)
      : null,

    // SEO fields (sanitized)
    slug: sanitizeOptional(input.slug) ?? null,
    seoTitle: sanitizeOptional(input.seoTitle) ?? null,
    seoDescription: sanitizeOptional(input.seoDescription) ?? null,
    socialImage: input.socialImage ?? null,
  };
};
