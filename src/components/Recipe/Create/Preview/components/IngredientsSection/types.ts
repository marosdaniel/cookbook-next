import type { RecipeIngredient } from '../types';

export type IngredientsSectionProps = {
  ingredients: RecipeIngredient[];
};

export type IngredientRowProps = {
  ingredient: RecipeIngredient;
  isLast: boolean;
  isEven: boolean;
};
