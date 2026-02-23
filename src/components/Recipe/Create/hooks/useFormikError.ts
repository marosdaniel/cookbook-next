import { getIn, useFormikContext } from 'formik';
import { useCallback } from 'react';

export function useFormikError() {
  const { touched, errors, validateField } = useFormikContext();

  const getFieldError = useCallback(
    (path: string): string | undefined => {
      const isTouched = Boolean(getIn(touched, path));
      const error = getIn(errors, path);
      return isTouched && typeof error === 'string' ? error : undefined;
    },
    [touched, errors],
  );

  /**
   * Call this inside an onChange handler.
   * It re-validates only the single field — but only when it already has an
   * error (touched + error). This way the error clears immediately once the
   * user types a valid value, without running the full schema on every
   * keystroke for pristine fields.
   */
  const revalidateOnChange = useCallback(
    (path: string) => {
      const hasError = Boolean(getIn(touched, path) && getIn(errors, path));
      if (hasError) {
        validateField(path);
      }
    },
    [touched, errors, validateField],
  );

  return { getFieldError, revalidateOnChange };
}
