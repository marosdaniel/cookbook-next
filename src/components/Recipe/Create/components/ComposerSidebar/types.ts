import type { ComposerSection, RecipeFormValues } from '../../types';

export interface ComposerSidebarProps {
  activeSection: ComposerSection;
  onSectionChange: (section: ComposerSection) => void;
  values: RecipeFormValues;
  completion: { done: number; total: number; percent: number };
  onAddIngredient: () => void;
  onAddStep: () => void;
  onResetDraft: () => void;
}
