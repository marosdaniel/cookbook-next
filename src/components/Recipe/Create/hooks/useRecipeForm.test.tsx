import { useMutation } from '@apollo/client/react';
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { useRecipeFormHook } from '../FormContext';
import type { RecipeFormValues, UseRecipeFormProps } from '../types';
import { useRecipeForm } from './useRecipeForm';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@mantine/hooks', () => ({
  useLocalStorage: vi.fn(),
  useDebouncedValue: vi.fn((value) => [value, vi.fn()]),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('../FormContext', () => ({
  useRecipeFormHook: vi.fn(() => mockForm),
}));

vi.mock('../utils', () => ({
  computeCompletion: vi.fn(() => ({ done: 5, total: 8, percent: 62 })),
  transformValuesToInput: vi.fn((values) => values),
  DRAFT_STORAGE_KEY: 'cookbook:create:draft:v2',
  EMPTY_FORM_VALUES: {
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
}));

vi.mock('@/lib/graphql/mutations', () => ({
  CREATE_RECIPE: 'CREATE_RECIPE_MUTATION',
}));

vi.mock('@/lib/validation/validation', () => ({
  recipeFormValidationSchema: {},
}));

vi.mock('mantine-form-zod-resolver', () => ({
  zodResolver: vi.fn(() => ({})),
}));

const createEmptyRecipeFormValues = (): RecipeFormValues => ({
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
  prepTimeMinutes: '',
  cookTimeMinutes: '',
  restTimeMinutes: '',
  servingUnit: null,
  cuisine: null,
  dietaryFlags: [],
  allergens: [],
  equipment: [],
  costLevel: null,
  tips: '',
  substitutions: '',
  slug: '',
  seoTitle: '',
  seoDescription: '',
  socialImage: '',
});

const createMockForm = () => {
  const form = {
    values: createEmptyRecipeFormValues(),
    errors: {},
    getValues: vi.fn(),
    setValues: vi.fn(),
    reset: vi.fn(),
    onSubmit: vi.fn(),
    insertListItem: vi.fn(),
    isDirty: vi.fn(),
    resetDirty: vi.fn(),
    validateField: vi.fn(),
  };

  form.getValues = vi.fn(() => form.values);
  form.setValues = vi.fn((nextValues) => {
    form.values = nextValues;
  });
  form.resetDirty = vi.fn((nextValues) => {
    form.values = nextValues ?? form.values;
    form.isDirty.mockReturnValue(false);
  });
  form.isDirty = vi.fn(() => false);

  return form;
};

let mockForm: ReturnType<typeof createMockForm>;

describe('useRecipeForm', () => {
  const mockProps: UseRecipeFormProps = {
    metadataLoaded: true,
    onSectionChange: vi.fn(),
    labels: [],
  };

  const routerPush = vi.fn();
  const mockCreateRecipe = vi.fn();
  let mutationOptions:
    | {
        onCompleted?: () => void;
        onError?: (error: { message?: string }) => void;
      }
    | undefined;
  const setDraft = vi.fn();
  const removeDraft = vi.fn();

  beforeAll(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mock-uuid',
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockForm = createMockForm();
    mutationOptions = undefined;
    mockCreateRecipe.mockResolvedValue(undefined);

    vi.mocked(useRouter).mockReturnValue({
      push: routerPush,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useTranslations).mockReturnValue(
      ((key: string) => key) as ReturnType<typeof useTranslations>,
    );
    vi.mocked(useMutation).mockImplementation((_, options) => {
      mutationOptions = options as typeof mutationOptions;
      return [mockCreateRecipe, { loading: false }] as never;
    });
    vi.mocked(useLocalStorage).mockImplementation(
      () => [null, setDraft, removeDraft] as never,
    );
  });

  it('should initialize with default values when no draft', () => {
    renderHook(() => useRecipeForm(mockProps));

    expect(vi.mocked(useRecipeFormHook)).toHaveBeenCalledWith(
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
    vi.mocked(useLocalStorage).mockImplementation(
      () =>
        [
          { values: draftValues, updatedAt: Date.now() },
          setDraft,
          removeDraft,
        ] as never,
    );

    renderHook(() => useRecipeForm(mockProps));

    expect(vi.mocked(useRecipeFormHook)).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: draftValues,
      }),
    );
  });

  it('should add ingredient', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      result.current.addIngredient();
    });

    expect(mockForm.insertListItem).toHaveBeenCalledWith(
      'ingredients',
      expect.objectContaining({
        localId: 'mock-uuid',
        name: '',
        quantity: '',
        unit: '',
      }),
    );
  });

  it('should add step', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      result.current.addStep();
    });

    expect(mockForm.insertListItem).toHaveBeenCalledWith(
      'preparationSteps',
      expect.objectContaining({
        localId: 'mock-uuid',
        description: '',
        order: 1,
      }),
    );
  });

  it('should save draft when metadata is loaded and the form is dirty', () => {
    mockForm.isDirty.mockReturnValue(true);

    renderHook(() => useRecipeForm(mockProps));

    expect(setDraft).toHaveBeenCalledWith({
      updatedAt: expect.any(Number),
      values: mockForm.values,
    });
  });

  it('should skip autosave when metadata is not loaded', () => {
    mockForm.isDirty.mockReturnValue(true);

    renderHook(() => useRecipeForm({ ...mockProps, metadataLoaded: false }));

    expect(setDraft).not.toHaveBeenCalled();
  });

  it('should save draft now', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      result.current.saveDraftNow();
    });

    expect(setDraft).toHaveBeenCalledWith({
      updatedAt: expect.any(Number),
      values: mockForm.getValues(),
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'notifications.draftSavedMessage',
        color: 'blue',
      }),
    );
  });

  it('should reset draft', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    act(() => {
      result.current.resetDraft();
    });

    expect(setDraft).toHaveBeenCalledWith(null);
    expect(mockForm.setValues).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '',
        ingredients: [],
      }),
    );
    expect(mockForm.resetDirty).toHaveBeenCalled();
    expect(mockProps.onSectionChange).toHaveBeenCalledWith('basics');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.draftClearedTitle',
      }),
    );
  });

  it('should publish the recipe with transformed values', async () => {
    const values = {
      ...mockForm.values,
      difficultyLevel: 'easy',
      category: 'dessert',
    };

    const { result } = renderHook(() => useRecipeForm(mockProps));

    await act(async () => {
      await result.current.handlePublish(values as never);
    });

    expect(mockCreateRecipe).toHaveBeenCalledWith({
      variables: {
        recipeCreateInput: values,
      },
    });
  });

  it('should stop publish when required fields are missing', async () => {
    const values = {
      ...mockForm.values,
      difficultyLevel: 'easy',
      category: null,
    };

    const { result } = renderHook(() => useRecipeForm(mockProps));

    await act(async () => {
      await result.current.handlePublish(values as never);
    });

    expect(mockCreateRecipe).not.toHaveBeenCalled();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.missingFieldsTitle',
      }),
    );
    expect(mockProps.onSectionChange).toHaveBeenCalledWith('basics');
  });

  it('should handle successful publish completion', () => {
    renderHook(() => useRecipeForm(mockProps));

    act(() => {
      mutationOptions?.onCompleted?.();
    });

    expect(setDraft).toHaveBeenCalledWith(null);
    expect(routerPush).toHaveBeenCalledWith('/me/my-recipes');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.recipeCreatedTitle',
      }),
    );
  });

  it('should handle publish errors', () => {
    renderHook(() => useRecipeForm(mockProps));

    act(() => {
      mutationOptions?.onError?.({ message: 'Boom' });
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.recipeCreateFailedTitle',
        message: 'Boom',
      }),
    );
  });

  it('should return correct completion', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    expect(result.current.completion).toEqual({
      done: 5,
      total: 8,
      percent: 62,
    });
  });

  it('should return last saved label for unsaved', () => {
    const { result } = renderHook(() => useRecipeForm(mockProps));

    expect(result.current.lastSavedLabel).toBe('sidebar.unsaved');
  });

  it('should return last saved label for just saved', () => {
    vi.mocked(useLocalStorage).mockImplementation(
      () => [{ updatedAt: Date.now() - 1000 }, setDraft, removeDraft] as never,
    );

    const { result } = renderHook(() => useRecipeForm(mockProps));

    expect(result.current.lastSavedLabel).toBe('sidebar.justSaved');
  });

  it('should return last saved label for saved ago', () => {
    vi.mocked(useLocalStorage).mockImplementation(
      () =>
        [
          { updatedAt: Date.now() - 5 * 60 * 1000 },
          setDraft,
          removeDraft,
        ] as never,
    );

    const { result } = renderHook(() => useRecipeForm(mockProps));

    expect(result.current.lastSavedLabel).toBe(
      'sidebar.savedAgo'.replace('{minutes}', '5'),
    );
  });
});
