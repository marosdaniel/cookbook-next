import type { UseFormReturnType } from '@mantine/form';
import { useCallback } from 'react';
import type { RecipeFormValues } from '../types';

/**
 * Helper hook that provides error-checking utilities for the recipe form.
 * This replaces the old Formik-based useFormikError hook.
 *
 * Expects the form instance to be passed directly — the Recipe Composer
 * passes it through its context or props.
 */
export function useFormError(form: UseFormReturnType<RecipeFormValues>) {
  const getFieldError = useCallback(
    (path: string): string | undefined => {
      const error = form.errors[path];
      return typeof error === 'string' ? error : undefined;
    },
    [form.errors],
  );

  /**
   * Call this inside an onChange handler.
   * It re-validates only the single field — but only when it already has an
   * error. This way the error clears immediately once the user types a valid
   * value, without running the full schema on every keystroke for pristine fields.
   */
  const revalidateOnChange = useCallback(
    (path: string) => {
      if (form.errors[path]) {
        form.validateField(path);
      }
    },
    [form],
  );

  return { getFieldError, revalidateOnChange };
}
