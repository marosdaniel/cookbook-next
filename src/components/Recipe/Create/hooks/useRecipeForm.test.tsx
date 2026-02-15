import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { act, renderHook } from '@testing-library/react';
import { useFormik } from 'formik';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UseRecipeFormProps } from '../types';
import { useRecipeForm } from './useRecipeForm';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
}));

vi.mock('@mantine/hooks', () => ({
  useLocalStorage: vi.fn(() => [null, vi.fn(), vi.fn()]),
  useDebouncedValue: vi.fn((value) => [value]),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('formik', () => ({
  useFormik: vi.fn(() => mockFormik),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

vi.mock('../utils', () => ({
  computeCompletion: vi.fn(() => ({ done: 5, total: 8, percent: 62 })),
  transformValuesToInput: vi.fn((values) => values),
  DRAFT_STORAGE_KEY: 'cookbook:create:draft:v2',
}));

vi.mock('@/lib/graphql/mutations', () => ({
  CREATE_RECIPE: 'CREATE_RECIPE_MUTATION',
}));

vi.mock('@/lib/validation/validation', () => ({
  recipeFormValidationSchema: {},
}));

vi.mock('zod-formik-adapter', () => ({
  toFormikValidationSchema: vi.fn(() => ({})),
}));

const mockFormik = {
  values: {
    title: '',
    description: '',
    imgSrc: '',
    cookingTime: '',
    servings: '',
    difficultyLevel: null,
    category: null,
    labels: [],
    youtubeLink: '',
    ingredients: [],
    preparationSteps: [],
  },
  setFieldValue: vi.fn(),
  resetForm: vi.fn(),
  submitForm: vi.fn(),
};

describe('useRecipeForm', () => {
  const mockProps: UseRecipeFormProps = {
    metadataLoaded: true,
    onSectionChange: vi.fn(),
    labels: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values when no draft', () => {
    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    expect(vi.mocked(useFormik)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: expect.objectContaining({
          title: '',
          ingredients: [],
        }),
      }),
    );
  });

  it('should initialize with draft values when draft exists', () => {
    const draftValues = { title: 'Draft Recipe', ingredients: [] };
    vi.mocked(useLocalStorage).mockReturnValue([
      { values: draftValues, updatedAt: Date.now() },
      vi.fn(),
      vi.fn(),
    ]);

    renderHook(() => useRecipeForm(mockProps));

    expect(vi.mocked(useFormik)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: draftValues,
      }),
    );
  });

  it('should add ingredient', () => {
    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      _result.current.addIngredient();
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith('ingredients', [
      expect.objectContaining({
        localId: 'mock-uuid',
        name: '',
        quantity: '',
        unit: '',
      }),
    ]);
  });

  it('should add step', () => {
    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      _result.current.addStep();
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith('preparationSteps', [
      expect.objectContaining({
        localId: 'mock-uuid',
        description: '',
        order: 1,
      }),
    ]);
  });

  it('should save draft now', () => {
    const setDraft = vi.fn();
    vi.mocked(useLocalStorage).mockReturnValue([null, setDraft, vi.fn()]);

    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      _result.current.saveDraftNow();
    });

    expect(setDraft).toHaveBeenCalledWith({
      updatedAt: expect.any(Number),
      values: mockFormik.values,
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'notifications.draftSavedMessage',
        color: 'blue',
      }),
    );
  });

  it('should reset draft', () => {
    const setDraft = vi.fn();
    vi.mocked(useLocalStorage).mockReturnValue([null, setDraft, vi.fn()]);

    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      _result.current.resetDraft();
    });

    expect(setDraft).toHaveBeenCalledWith(null);
    expect(mockFormik.resetForm).toHaveBeenCalledWith({
      values: expect.objectContaining({
        title: '',
        ingredients: [],
      }),
    });
    expect(mockProps.onSectionChange).toHaveBeenCalledWith('basics');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.draftClearedTitle',
      }),
    );
  });

  it('should return correct completion', () => {
    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    expect(_result.current.completion).toEqual({
      done: 5,
      total: 8,
      percent: 62,
    });
  });

  it('should return last saved label for unsaved', () => {
    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    expect(_result.current.lastSavedLabel).toBe('sidebar.unsaved');
  });

  it('should return last saved label for just saved', () => {
    vi.mocked(useLocalStorage).mockReturnValue([
      { updatedAt: Date.now() - 1000 },
      vi.fn(),
      vi.fn(),
    ]);

    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    expect(_result.current.lastSavedLabel).toBe('sidebar.justSaved');
  });

  it('should return last saved label for saved ago', () => {
    vi.mocked(useLocalStorage).mockReturnValue([
      { updatedAt: Date.now() - 5 * 60 * 1000 }, // 5 minutes ago
      vi.fn(),
      vi.fn(),
    ]);

    const { result: _result } = renderHook(() => useRecipeForm(mockProps));

    expect(_result.current.lastSavedLabel).toBe(
      'sidebar.savedAgo'.replace('{minutes}', '5'),
    );
  });
});
