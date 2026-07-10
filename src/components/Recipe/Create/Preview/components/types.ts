import type { PreviewProps } from '../../types';

export type RecipePreviewValues = PreviewProps['values'];

export type RecipeIngredient = RecipePreviewValues['ingredients'][number];

export type RecipePreparationStep =
  RecipePreviewValues['preparationSteps'][number];
