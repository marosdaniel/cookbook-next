import type { UseFormReturnType } from '@mantine/form';
import { useCallback } from 'react';
import type {
  FormIngredient,
  FormPreparationStep,
  RecipeFormValues,
} from '../types';

export type RecipeFormFieldPath =
  | keyof RecipeFormValues
  | `ingredients[${number}].${keyof FormIngredient}`
  | `preparationSteps[${number}].${keyof FormPreparationStep}`;

export const useFormError = (form: UseFormReturnType<RecipeFormValues>) => {
  const getFieldError = useCallback(
    (path: RecipeFormFieldPath): string | undefined => {
      const error = form.errors[path];

      return typeof error === 'string' ? error : undefined;
    },
    [form.errors],
  );

  const revalidateOnChange = useCallback(
    (path: RecipeFormFieldPath) => {
      if (!form.errors[path]) {
        return;
      }

      form.validateField(path);
    },
    [form],
  );

  return {
    getFieldError,
    revalidateOnChange,
  };
};
