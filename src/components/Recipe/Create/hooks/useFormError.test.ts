import type { UseFormReturnType } from '@mantine/form';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RecipeFormValues } from '../types';
import { useFormError } from './useFormError';

const createForm = (errors: Partial<Record<keyof RecipeFormValues, unknown>>) =>
  ({
    errors,
    validateField: vi.fn(),
  }) as unknown as UseFormReturnType<RecipeFormValues>;

describe('useFormError', () => {
  it('returns undefined for non-string errors', () => {
    const form = createForm({
      title: { message: 'Invalid' },
    });

    const { result } = renderHook(() => useFormError(form));

    expect(result.current.getFieldError('title')).toBeUndefined();
  });

  it('returns a string error when present', () => {
    const form = createForm({
      title: 'Required',
    });

    const { result } = renderHook(() => useFormError(form));

    expect(result.current.getFieldError('title')).toBe('Required');
  });

  it('revalidates only when an error exists', () => {
    const validateField = vi.fn();
    const form = {
      errors: {
        title: 'Required',
      },
      validateField,
    } as unknown as UseFormReturnType<RecipeFormValues>;

    const { result } = renderHook(() => useFormError(form));

    result.current.revalidateOnChange('title');

    expect(validateField).toHaveBeenCalledWith('title');
  });

  it('does nothing when there is no existing error', () => {
    const validateField = vi.fn();
    const form = {
      errors: {},
      validateField,
    } as unknown as UseFormReturnType<RecipeFormValues>;

    const { result } = renderHook(() => useFormError(form));

    result.current.revalidateOnChange('title');

    expect(validateField).not.toHaveBeenCalled();
  });
});
