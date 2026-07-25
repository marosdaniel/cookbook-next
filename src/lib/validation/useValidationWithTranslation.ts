'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import type { ZodType } from 'zod';
import { zodResolver } from './zodResolver';

/**
 * Custom hook to create a memoized validation function with i18n support
 * Automatically handles translation of validation error messages
 *
 * @param schema - Zod validation schema
 * @returns Memoized validation function for use with Mantine's useForm
 *
 * @example
 * ```typescript
 * const form = useForm({
 *   validate: useValidationWithTranslation(mySchema),
 *   // ... other config
 * });
 * ```
 */
export function useValidationWithTranslation(schema: ZodType) {
  const translate = useTranslations();

  return useCallback(
    (values: unknown) => zodResolver(schema, (key) => translate(key))(values),
    [schema, translate],
  );
}
