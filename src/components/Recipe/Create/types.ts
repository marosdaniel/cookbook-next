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

export type ComposerMode = 'create' | 'edit';

export type ComposerSection = 'basics' | 'media' | 'ingredients' | 'steps';

export interface UseRecipeFormProps {
  metadataLoaded: boolean;
  onSectionChange: (section: ComposerSection) => void;
  labels: TMetadataCleaned[];
}

export interface DraftState {
  updatedAt: number;
  values: RecipeFormValues;
}
