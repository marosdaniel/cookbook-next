import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecipeFormValues } from '../types';
import { useRecipeEditForm } from './useRecipeEditForm';

const createEmptyRecipeFormValues = (): RecipeFormValues => ({
  title: 'Initial',
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

const mockForm = {
  values: createEmptyRecipeFormValues(),
  errors: {},
  getValues: vi.fn(),
  setValues: vi.fn(),
  resetDirty: vi.fn(),
  resetTouched: vi.fn(),
  insertListItem: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('@tabler/icons-react', () => ({
  IconCheck: () => null,
}));

vi.mock('../FormContext', () => ({
  useRecipeFormHook: vi.fn(() => mockForm),
}));

vi.mock('../utils', () => ({
  computeCompletion: vi.fn(() => ({ done: 3, total: 5, percent: 60 })),
  transformValuesToInput: vi.fn((values) => values),
}));

vi.mock('@/lib/graphql/mutations', () => ({
  EDIT_RECIPE: 'EDIT_RECIPE_MUTATION',
}));

vi.mock('@/lib/validation/validation', () => ({
  recipeFormValidationSchema: {},
}));

vi.mock('mantine-form-zod-resolver', () => ({
  zodResolver: vi.fn(() => ({})),
}));

const { notifications } = await import('@mantine/notifications');
const { useMutation } = await import('@apollo/client/react');

describe('useRecipeEditForm', () => {
  const routerPush = vi.fn();
  const editRecipe = vi.fn();
  const onSectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockForm.getValues.mockImplementation(() => mockForm.values);
    mockForm.setValues.mockImplementation((nextValues) => {
      mockForm.values = nextValues;
    });
    mockForm.resetDirty.mockImplementation(() => undefined);
    mockForm.resetTouched.mockImplementation(() => undefined);
    mockForm.insertListItem.mockImplementation(() => undefined);
    vi.mocked(useRouter).mockReturnValue({
      push: routerPush,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useTranslations).mockReturnValue(
      ((key: string) => key) as ReturnType<typeof useTranslations>,
    );
    vi.mocked(useMutation).mockReturnValue([
      editRecipe,
      { loading: false },
    ] as never);
    editRecipe.mockResolvedValue(undefined);
  });

  it('hydrates the form when a new server version arrives', () => {
    const initialValues = {
      ...mockForm.values,
      title: 'Server version',
    };

    const { rerender } = renderHook(
      ({ initialValuesKey }) =>
        useRecipeEditForm({
          recipeId: 'recipe-1',
          initialValues,
          initialValuesKey,
          onSectionChange,
          labels: [],
        }),
      {
        initialProps: { initialValuesKey: 'v1' },
      },
    );

    expect(mockForm.setValues).toHaveBeenCalledWith(initialValues);
    expect(mockForm.resetDirty).toHaveBeenCalledWith(initialValues);

    rerender({ initialValuesKey: 'v2' });

    expect(mockForm.setValues).toHaveBeenCalledTimes(2);
  });

  it('does not rehydrate when the same values key is reused', () => {
    const initialValues = {
      ...mockForm.values,
      title: 'Server version',
    };

    const { rerender } = renderHook(
      ({ initialValuesKey }) =>
        useRecipeEditForm({
          recipeId: 'recipe-1',
          initialValues,
          initialValuesKey,
          onSectionChange,
          labels: [],
        }),
      {
        initialProps: { initialValuesKey: 'v1' },
      },
    );

    rerender({ initialValuesKey: 'v1' });

    expect(mockForm.setValues).toHaveBeenCalledTimes(1);
  });

  it('stops publish when required fields are missing', async () => {
    const { result } = renderHook(() =>
      useRecipeEditForm({
        recipeId: 'recipe-1',
        initialValues: mockForm.values,
        initialValuesKey: 'v1',
        onSectionChange,
        labels: [],
      }),
    );

    await act(async () => {
      await result.current.handlePublish({
        ...mockForm.values,
        difficultyLevel: 'easy',
        category: null,
      } as never);
    });

    expect(editRecipe).not.toHaveBeenCalled();
    expect(onSectionChange).toHaveBeenCalledWith('basics');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.missingFieldsTitle',
      }),
    );
  });

  it('publishes edits and navigates on success', async () => {
    const { result } = renderHook(() =>
      useRecipeEditForm({
        recipeId: 'recipe-1',
        initialValues: mockForm.values,
        initialValuesKey: 'v1',
        onSectionChange,
        labels: [],
      }),
    );

    await act(async () => {
      await result.current.handlePublish({
        ...mockForm.values,
        difficultyLevel: 'easy',
        category: 'dessert',
      } as never);
    });

    expect(editRecipe).toHaveBeenCalledWith({
      variables: {
        id: 'recipe-1',
        recipeEditInput: {
          ...mockForm.values,
          difficultyLevel: 'easy',
          category: 'dessert',
        },
      },
    });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.recipeUpdatedTitle',
      }),
    );
    expect(routerPush).toHaveBeenCalledWith('/me/my-recipes');
  });

  it('shows an error notification when editing fails', async () => {
    editRecipe.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() =>
      useRecipeEditForm({
        recipeId: 'recipe-1',
        initialValues: mockForm.values,
        initialValuesKey: 'v1',
        onSectionChange,
        labels: [],
      }),
    );

    await act(async () => {
      await result.current.handlePublish({
        ...mockForm.values,
        difficultyLevel: 'easy',
        category: 'dessert',
      } as never);
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.recipeUpdateFailedTitle',
        message: 'boom',
      }),
    );
  });

  it('resets the form to the original values', () => {
    const { result } = renderHook(() =>
      useRecipeEditForm({
        recipeId: 'recipe-1',
        initialValues: mockForm.values,
        initialValuesKey: 'v1',
        onSectionChange,
        labels: [],
      }),
    );

    act(() => {
      result.current.resetToOriginal();
    });

    expect(mockForm.setValues).toHaveBeenCalledWith(mockForm.values);
    expect(mockForm.resetDirty).toHaveBeenCalledWith(mockForm.values);
    expect(mockForm.resetTouched).toHaveBeenCalled();
    expect(onSectionChange).toHaveBeenCalledWith('basics');
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'notifications.changesResetTitle',
      }),
    );
  });

  it('adds a new ingredient and preparation step', () => {
    const { result } = renderHook(() =>
      useRecipeEditForm({
        recipeId: 'recipe-1',
        initialValues: mockForm.values,
        initialValuesKey: 'v1',
        onSectionChange,
        labels: [],
      }),
    );

    act(() => {
      result.current.addIngredient();
      result.current.addStep();
    });

    expect(mockForm.insertListItem).toHaveBeenCalledWith(
      'ingredients',
      expect.objectContaining({
        localId: expect.any(String),
        name: '',
        quantity: '',
        unit: '',
      }),
    );
    expect(mockForm.insertListItem).toHaveBeenCalledWith(
      'preparationSteps',
      expect.objectContaining({
        localId: expect.any(String),
        description: '',
        order: 1,
      }),
    );
  });
});
