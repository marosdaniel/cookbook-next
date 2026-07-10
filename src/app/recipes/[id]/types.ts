import type {
  RecipeDetail,
  RecipeIngredient,
  RecipePreparationStep,
} from '@/types/recipe';

export type Recipe = RecipeDetail;
export type Ingredient = RecipeIngredient;
export type IngredientId = Ingredient['localId'];
export type PreparationStep = RecipePreparationStep;

export interface RecipeDetailData {
  getRecipeById: Recipe;
}

export interface RecipeDetailClientProps {
  recipeId: string;
}

export interface RecipeNotFoundProps {
  errorMessage?: string;
}

export interface RecipeHeroProps {
  recipe: Recipe;
  isOwner: boolean;
}

export interface RecipeIngredientsProps {
  ingredients: Ingredient[];
  servingMultiplier: number;
  adjustedServings: number;
  checkedIngredients: ReadonlySet<IngredientId>;
  onToggleIngredient: (localId: IngredientId) => void;
  onIncrementServings: () => void;
  onDecrementServings: () => void;
}

export interface RecipeStepsProps {
  steps: PreparationStep[];
}

export interface RecipeVideoProps {
  youtubeId: string;
  title: string;
}
