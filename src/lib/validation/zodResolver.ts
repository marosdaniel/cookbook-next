import type { FormErrors } from '@mantine/form';
import type { ZodType } from 'zod';
import { translateErrorMessage } from './validationErrorMessages';

/**
 * Custom zodResolver compatible with @mantine/form v9.
 * Replaces mantine-form-zod-resolver which only supports Mantine v7.
 *
 * @param schema - The Zod schema to validate against
 * @param translate - Optional translation function to translate error messages
 * @returns A resolver function that returns form errors
 */
export function zodResolver(
  schema: ZodType,
  translate?: (key: string) => string,
) {
  return (values: unknown): FormErrors => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      result.error.issues.map((issue) => {
        let message = issue.message;
        if (translate) {
          message = translateErrorMessage(message, translate);
        }
        return [issue.path.join('.'), message];
      }),
    );
  };
}
