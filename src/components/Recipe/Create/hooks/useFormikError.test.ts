import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormikError } from './useFormikError';

// Mock Formik context
const mockUseFormikContext = vi.fn();
vi.mock('formik', () => ({
  useFormikContext: () => mockUseFormikContext(),
  getIn: vi.fn((obj, path) => {
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc?.[key], obj);
  }),
}));

describe('useFormikError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return undefined when field is not touched', () => {
    mockUseFormikContext.mockReturnValue({
      touched: {},
      errors: { title: 'Required' },
    });

    const { result } = renderHook(() => useFormikError());
    const error = result.current.getFieldError('title');

    expect(error).toBeUndefined();
  });

  it('should return undefined when field has no error', () => {
    mockUseFormikContext.mockReturnValue({
      touched: { title: true },
      errors: {},
    });

    const { result } = renderHook(() => useFormikError());
    const error = result.current.getFieldError('title');

    expect(error).toBeUndefined();
  });

  it('should return error when field is touched and has string error', () => {
    mockUseFormikContext.mockReturnValue({
      touched: { title: true },
      errors: { title: 'Title is required' },
    });

    const { result } = renderHook(() => useFormikError());
    const error = result.current.getFieldError('title');

    expect(error).toBe('Title is required');
  });

  it('should return undefined when error is not a string', () => {
    mockUseFormikContext.mockReturnValue({
      touched: { title: true },
      errors: { title: { message: 'Invalid' } },
    });

    const { result } = renderHook(() => useFormikError());
    const error = result.current.getFieldError('title');

    expect(error).toBeUndefined();
  });

  it('should handle nested paths', () => {
    mockUseFormikContext.mockReturnValue({
      touched: { ingredients: [{ name: true }] },
      errors: { ingredients: [{ name: 'Name required' }] },
    });

    const { result } = renderHook(() => useFormikError());
    const error = result.current.getFieldError('ingredients.0.name');

    expect(error).toBe('Name required');
  });
});
