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
}

export interface RecipeCreateInput extends RecipeInputBase {}

export interface RecipeEditInput extends RecipeInputBase {}

export interface RatingInput {
  recipeId: string;
  ratingValue: number;
}
