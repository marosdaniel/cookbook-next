import type { FormErrors } from '@mantine/form';
import type { ZodType } from 'zod';

/**
 * Custom zodResolver compatible with @mantine/form v9.
 * Replaces mantine-form-zod-resolver which only supports Mantine v7.
 */
export function zodResolver(schema: ZodType) {
  return (values: unknown): FormErrors => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    return Object.fromEntries(
      result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
    );
  };
}
