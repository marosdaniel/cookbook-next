import { getIn, useFormikContext } from 'formik';

export function useFormikError() {
  const { touched, errors } = useFormikContext();

  const getFieldError = (path: string): string | undefined => {
    const isTouched = Boolean(getIn(touched, path));
    const error = getIn(errors, path);
    return isTouched && typeof error === 'string' ? error : undefined;
  };

  return { getFieldError };
}
