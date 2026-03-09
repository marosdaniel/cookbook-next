import type { UseFormReturnType } from '@mantine/form';
import type { RefObject } from 'react';

export interface TMetadataCleaned {
  value: string;
  label: string;
}

interface TListItem {
  localId: string;
}

export interface TIngredient extends TListItem {
  name: string;
  quantity: number | '';
  unit: string;
}

export interface TPreparationStep extends TListItem {
  description: string;
  order: number;
}

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
  /** Header title (e.g. "Create Recipe" | "Edit Recipe") */
  headerTitle: string;
  /** Submit button label (e.g. "Publish" | "Save Changes") */
  submitLabel: string;
  /** Reset button label (e.g. "Clear draft" | "Reset changes") */
  resetLabel: string;
  /**
   * Optional ref that parent components can use to imperatively
   * navigate to a specific section (e.g. on validation failure).
   */
  goToSectionRef?: RefObject<((section: ComposerSection) => void) | null>;
}
