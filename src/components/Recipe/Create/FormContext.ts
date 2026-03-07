import { createFormContext } from '@mantine/form';
import type { RecipeFormValues } from './types';

export const [RecipeFormProvider, useRecipeFormContext, useRecipeFormHook] =
  createFormContext<RecipeFormValues>();
