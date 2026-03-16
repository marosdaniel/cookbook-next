import type {
  RecipeDetail,
  RecipeIngredient,
  RecipePreparationStep,
} from '@/types/recipe';

export type Recipe = RecipeDetail;

export interface RecipeDetailData {
  getRecipeById: Recipe;
}

export type Ingredient = RecipeIngredient;
export type PreparationStep = RecipePreparationStep;
export type RecipeIngredientId = RecipeIngredient['localId'];

export interface RecipeDetailClientProps {
  recipeId: string;
}

export interface RecipeIngredientsProps {
  ingredients: RecipeIngredient[];
  servingMultiplier: number;
  adjustedServings: number;
  checkedIngredients: Set<RecipeIngredientId>;
  onToggleIngredient: (localId: RecipeIngredientId) => void;
  onIncrementServings: () => void;
  onDecrementServings: () => void;
}

export interface RecipeNotFoundProps {
  errorMessage?: string;
}

export interface RecipeHeroProps {
  recipe: Recipe;
  isOwner: boolean;
}

export interface RecipeStepsProps {
  steps: RecipePreparationStep[];
}

export interface RecipeVideoProps {
  youtubeId: string;
  title: string;
}
