export interface TMetadataCleaned {
  value: string;
  label: string;
}

export interface TIngredient {
  localId: string;
  name: string;
  quantity: number | '';
  unit: string;
}

export interface TPreparationStep {
  localId: string;
  description: string;
  order: number;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  imgSrc: string;
  servings: number | '';
  cookingTime: number | '';
  difficultyLevel: TMetadataCleaned | null;
  category: TMetadataCleaned | null;
  labels: string[]; // array of keys
  youtubeLink: string;
  ingredients: TIngredient[];
  preparationSteps: TPreparationStep[];
}

export type ComposerSection = 'basics' | 'media' | 'ingredients' | 'steps';
