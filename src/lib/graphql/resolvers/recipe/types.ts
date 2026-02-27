export interface IngredientInput {
  localId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface PreparationStepInput {
  description: string;
  order: number;
}

export interface MetaInputPartial {
  value: string;
  label: string;
}

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
