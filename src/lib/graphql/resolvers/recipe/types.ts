import type {
  IngredientInput,
  MetaInputPartial,
  PreparationStepInput,
} from '@/lib/graphql/generated/resolvers-types';

export type NormalizablePreparationStep = PreparationStepInput & {
  localId?: string;
};

export interface NormalizedRecipeInput {
  title: string;
  description?: string;
  ingredients: IngredientInput[];
  preparationSteps: NormalizablePreparationStep[];
  category: MetaInputPartial;
  labels?: MetaInputPartial[];
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: MetaInputPartial;
  servings: number;
  youtubeLink?: string;

  // New time fields
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  restTimeMinutes?: number;

  // New metadata fields
  servingUnit?: MetaInputPartial;
  cuisine?: MetaInputPartial;
  dietaryFlags?: MetaInputPartial[];
  allergens?: MetaInputPartial[];
  equipment?: MetaInputPartial[];
  costLevel?: MetaInputPartial;

  // Text fields
  tips?: string;
  substitutions?: string;

  // SEO fields
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}
