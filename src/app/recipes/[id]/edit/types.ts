import type { RecipeBase } from '@/types/recipe';

export interface RecipeByIdData {
  getRecipeById: RecipeBase;
}

export interface RecipeEditClientProps {
  recipeId: string;
}
