import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ButtonProps,
  DivProps,
  InputProps,
  ParagraphProps,
} from '../../../../../types/test';
import IngredientsSection from './IngredientsSection';

vi.mock('@mantine/core', () => ({
  ActionIcon: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  Badge: ({ children, ...props }: ParagraphProps) => (
    <span {...props}>{children}</span>
  ),
  Button: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  Group: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Paper: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Select: ({ value, onChange, ...props }: InputProps) => (
    <input
      value={String(value ?? '')}
      onChange={(event) =>
        onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>)
      }
      {...props}
    />
  ),
  Stack: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Switch: ({ checked, onChange, ...props }: InputProps) => (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
      {...props}
    />
  ),
  Text: ({ children, ...props }: ParagraphProps) => (
    <p {...props}>{children}</p>
  ),
  TextInput: ({ value, onChange, ...props }: InputProps) => (
    <input
      value={String(value ?? '')}
      onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
      {...props}
    />
  ),
  ThemeIcon: ({ children, ...props }: DivProps) => (
    <div {...props}>{children}</div>
  ),
  Title: ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'h3'> & {
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <h3 {...props}>{children}</h3>,
}));

const { mockUseRecipeFormContext, mockUseFormError } = vi.hoisted(() => ({
  mockUseRecipeFormContext: vi.fn(),
  mockUseFormError: vi.fn(),
}));

vi.mock('../../FormContext', () => ({
  useRecipeFormContext: mockUseRecipeFormContext,
}));

vi.mock('../../hooks/useFormError', () => ({
  useFormError: mockUseFormError,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const createFormValues = (
  overrides: Partial<Record<string, unknown>> = {},
) => ({
  title: 'Test recipe',
  description: '',
  imgSrc: '',
  servings: '',
  cookingTime: '',
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
  ...overrides,
});

describe('IngredientsSection', () => {
  const setFieldValue = vi.fn();
  const revalidateOnChange = vi.fn();

  beforeEach(() => {
    setFieldValue.mockReset();
    revalidateOnChange.mockReset();
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues(),
      setFieldValue,
      errors: {},
    });
    mockUseFormError.mockReturnValue({
      getFieldError: () => undefined,
      revalidateOnChange,
    });
  });

  it('renders the empty state and calls the add handler', () => {
    const onAdd = vi.fn();

    render(
      <IngredientsSection
        unitOptions={[]}
        onAdd={onAdd}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId('recipe-ingredients-section'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recipe-ingredients-add')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recipe-ingredients-add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('renders existing ingredients and allows editing and removal', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({
        ingredients: [
          {
            localId: 'ingredient-1',
            name: 'Salt',
            quantity: 2,
            unit: 'g',
            isOptional: false,
            note: 'Fine',
          },
        ],
      }),
      setFieldValue,
      errors: {},
    });

    render(
      <IngredientsSection
        unitOptions={[{ value: 'g', label: 'g' }]}
        onAdd={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByTestId('recipe-ingredient-name')).toBeInTheDocument();
    expect(
      screen.getByTestId('recipe-ingredient-quantity'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('recipe-ingredient-unit')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-ingredient-remove')).toBeInTheDocument();

    fireEvent.change(screen.getByTestId('recipe-ingredient-name'), {
      target: { value: 'Sugar' },
    });
    fireEvent.change(screen.getByTestId('recipe-ingredient-quantity'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByTestId('recipe-ingredient-remove'));

    expect(setFieldValue).toHaveBeenCalledWith('ingredients', []);
    expect(revalidateOnChange).toHaveBeenCalledWith('ingredients[0].name');
    expect(revalidateOnChange).toHaveBeenCalledWith('ingredients[0].quantity');
  });

  it('toggles optional flag and note', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({
        ingredients: [
          {
            localId: 'ingredient-2',
            name: 'Eggs',
            quantity: 2,
            unit: null,
            isOptional: false,
            note: '',
          },
        ],
      }),
      setFieldValue,
      errors: {},
    });

    render(
      <IngredientsSection
        unitOptions={[]}
        onAdd={vi.fn()}
        onBack={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('recipe-ingredient-optional'));
    fireEvent.change(screen.getByTestId('recipe-ingredient-note'), {
      target: { value: 'Free range' },
    });

    expect(setFieldValue).toHaveBeenCalledWith(
      'ingredients[0].isOptional',
      true,
    );
    expect(setFieldValue).toHaveBeenCalledWith(
      'ingredients[0].note',
      'Free range',
    );
  });

  it('calls the back and next handlers', () => {
    const onBack = vi.fn();
    const onNext = vi.fn();

    render(
      <IngredientsSection
        unitOptions={[]}
        onAdd={vi.fn()}
        onBack={onBack}
        onNext={onNext}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'back' }));
    fireEvent.click(screen.getByTestId('recipe-ingredients-next'));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
