import type { RecipePreparationStep } from '../types';

export type { RecipePreparationStep } from '../types';

export type PreparationSectionProps = {
  steps: RecipePreparationStep[];
};

export type PreparationStepProps = {
  step: RecipePreparationStep;
  stepNumber: number;
};
