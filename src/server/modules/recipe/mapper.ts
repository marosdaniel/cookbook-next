import { Prisma } from '@prisma/client';
import { sanitizeOptional, sanitizeText } from '@/lib/sanitize/sanitize';
import {
  MetadataService,
  metadataLookupKey,
} from '@/lib/services/MetadataService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { MetaDomainInputPartial, NormalizedRecipeInput } from './types';

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
    translationKeys: await MetadataService.getTranslationKeyLookup(),
  };
};

const mapMetadataToJson = (
  m: MetaDomainInputPartial,
  type: string,
  translationKeys: ReadonlyMap<string, string>,
) => ({
  key: m.value,
  label: translationKeys.get(metadataLookupKey(type, m.value)) ?? m.label,
  type,
});

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
    translationKeys,
  } = metadata;

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
    category: mapMetadataToJson(categoryFromInput, 'CATEGORY', translationKeys),
    difficultyLevel: mapMetadataToJson(
      difficultyLevelFromInput,
      'DIFFICULTY_LEVEL',
      translationKeys,
    ),
    labels: labelsFromInput.map((l) =>
      mapMetadataToJson(l, 'LABEL', translationKeys),
    ),
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
      ? mapMetadataToJson(servingUnitFromInput, 'SERVING_UNIT', translationKeys)
      : Prisma.DbNull,
    cuisine: cuisineFromInput
      ? mapMetadataToJson(cuisineFromInput, 'CUISINE', translationKeys)
      : Prisma.DbNull,
    dietaryFlags: dietaryFlagsFromInput.map((d) =>
      mapMetadataToJson(d, 'DIET', translationKeys),
    ),
    allergens: allergensFromInput.map((a) =>
      mapMetadataToJson(a, 'ALLERGEN', translationKeys),
    ),
    equipment: equipmentFromInput.map((e) =>
      mapMetadataToJson(e, 'EQUIPMENT', translationKeys),
    ),
    costLevel: costLevelFromInput
      ? mapMetadataToJson(costLevelFromInput, 'COST_LEVEL', translationKeys)
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
