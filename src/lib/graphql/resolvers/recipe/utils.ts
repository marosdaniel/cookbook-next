import type {
  RecipeCreateInput as GeneratedRecipeCreateInput,
  RecipeEditInput as GeneratedRecipeEditInput,
  MetaInputPartial,
} from '@/lib/graphql/generated/resolvers-types';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  assertPresent,
  buildRecipeData,
  resolveRecipeMetadata,
  sanitizeRecipeInput,
  validateRequiredFields,
} from '@/server/modules/recipe/mapper';
import type {
  NormalizablePreparationStep,
  NormalizedRecipeInput,
} from '@/server/modules/recipe/types';
import type { GraphQLContext } from '@/types/graphql/context';

export {
  assertPresent,
  buildRecipeData,
  resolveRecipeMetadata,
  sanitizeRecipeInput,
  validateRequiredFields,
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
