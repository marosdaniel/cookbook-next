import type { UseFormReturnType } from '@mantine/form';
import type { RefObject } from 'react';
import type {
  RecipeIngredient,
  RecipeIngredientId,
  RecipeMetadataOption,
  RecipePreparationStep,
} from '@/types/recipe';

export type MetadataOption = RecipeMetadataOption;
export type FormListItemId = RecipeIngredientId;

export interface FormListItem {
  localId: FormListItemId;
}

export type FormIngredient = Omit<RecipeIngredient, 'localId' | 'quantity'> &
  FormListItem & {
    quantity: number | '';
  };

export type FormPreparationStep = Omit<
  RecipePreparationStep,
  'localId' | 'order'
> &
  FormListItem & {
    order: number;
  };

export interface RecipeCompletion {
  done: number;
  total: number;
  percent: number;
}

export interface RecipeFormValues {
  title: string;
  description: string;
  imgSrc: string;
  servings: number | '';
  cookingTime: number | '';
  difficultyLevel: MetadataOption | null;
  category: MetadataOption | null;
  labels: string[];
  youtubeLink: string;
  ingredients: FormIngredient[];
  preparationSteps: FormPreparationStep[];

  prepTimeMinutes: number | '';
  cookTimeMinutes: number | '';
  restTimeMinutes: number | '';

  servingUnit: MetadataOption | null;
  cuisine: MetadataOption | null;
  dietaryFlags: string[];
  allergens: string[];
  equipment: string[];
  costLevel: MetadataOption | null;

  tips: string;
  substitutions: string;

  slug: string;
  seoTitle: string;
  seoDescription: string;
  socialImage: string;
}

export type ComposerMode = 'create' | 'edit';

export type ComposerSection = 'basics' | 'media' | 'ingredients' | 'steps';

export interface UseRecipeFormProps {
  metadataLoaded: boolean;
  onSectionChange: (section: ComposerSection) => void;
  labels: MetadataOption[];
}

export interface DraftState {
  updatedAt: number;
  values: RecipeFormValues;
}

export interface RecipeComposerProps {
  mode: ComposerMode;
  form: UseFormReturnType<RecipeFormValues>;
  handlePublish: (values: RecipeFormValues) => void;
  submitLoading: boolean;
  completion: RecipeCompletion;
  lastSavedLabel: string;
  onSave: () => void;
  onReset: () => void;
  addIngredient: () => void;
  addStep: () => void;
  headerTitle: string;
  submitLabel: string;
  resetLabel: string;
  goToSectionRef?: RefObject<((section: ComposerSection) => void) | null>;
}

export interface PreviewProps {
  labels: MetadataOption[];
  values: RecipeFormValues;
}
