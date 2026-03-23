import type {
  RecipeIngredient,
  RecipeMetadataOption,
  RecipePreparationStep,
} from '@/types/recipe';

export type IngredientInput = RecipeIngredient;

export type PreparationStepInput = RecipePreparationStep;

export type MetaInputPartial = RecipeMetadataOption;

export interface RecipeInputBase {
  title: string;
  description?: string;
  ingredients: IngredientInput[];
  preparationSteps: PreparationStepInput[];
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

export interface RecipeCreateInput extends RecipeInputBase {}

export interface RecipeEditInput extends RecipeInputBase {}

export interface RatingInput {
  recipeId: string;
  ratingValue: number;
}
