import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ButtonProps,
  DivProps,
  InputProps,
  ParagraphProps,
  TextareaProps,
} from '../../../../../types/test';
import BasicsSection from './BasicsSection';

vi.mock('@mantine/core', () => ({
  Badge: ({ children, ...props }: ParagraphProps) => (
    <span {...props}>{children}</span>
  ),
  Box: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  Group: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  MultiSelect: ({ value, onChange, ...props }: InputProps) => (
    <input
      value={String(value ?? '')}
      onChange={(event) => {
        const nextValue = event.target.value;
        (onChange as ((value: string[]) => void) | undefined)?.([nextValue]);
      }}
      onInput={(event) => {
        const nextValue = (event.target as HTMLInputElement).value;
        (onChange as ((value: string[]) => void) | undefined)?.([nextValue]);
      }}
      {...props}
    />
  ),
  Paper: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Select: ({ value, onChange, ...props }: InputProps) => (
    <input
      value={String(value ?? '')}
      onChange={(event) =>
        (onChange as ((value: string) => void) | undefined)?.(
          event.target.value,
        )
      }
      onInput={(event) =>
        (onChange as ((value: string) => void) | undefined)?.(
          (event.target as HTMLInputElement).value,
        )
      }
      {...props}
    />
  ),
  Stack: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: ParagraphProps) => (
    <p {...props}>{children}</p>
  ),
  Textarea: ({ value, onChange, ...props }: TextareaProps) => (
    <textarea
      value={String(value ?? '')}
      onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      {...props}
    />
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

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    span: ({ children }: { children?: React.ReactNode }) => (
      <span>{children}</span>
    ),
  },
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
  title: 'Recipe title',
  description: 'Recipe story',
  imgSrc: '',
  servings: 4,
  cookingTime: 30,
  difficultyLevel: { value: 'easy', label: 'Easy' },
  category: { value: 'dessert', label: 'Dessert' },
  labels: ['sweet'],
  youtubeLink: '',
  ingredients: [],
  preparationSteps: [],
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  restTimeMinutes: 5,
  servingUnit: { value: 'portion', label: 'portion' },
  cuisine: { value: 'italian', label: 'Italian' },
  dietaryFlags: ['vegetarian'],
  allergens: ['nuts'],
  equipment: ['pan'],
  costLevel: { value: 'budget', label: 'Budget' },
  tips: 'Tip',
  substitutions: 'Sub',
  slug: '',
  seoTitle: '',
  seoDescription: '',
  socialImage: '',
  ...overrides,
});

describe('BasicsSection', () => {
  const setFieldValue = vi.fn();
  const revalidateOnChange = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
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

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the section and updates the title with debounced sync', () => {
    render(
      <BasicsSection
        categories={[]}
        levels={[]}
        labels={[]}
        cuisines={[]}
        servingUnits={[]}
        costLevels={[]}
        dietaryFlags={[]}
        allergens={[]}
        equipment={[]}
        onNext={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('recipe-basics-title'), {
      target: { value: 'New title' },
    });

    expect(setFieldValue).not.toHaveBeenCalledWith('title', 'New title');

    vi.advanceTimersByTime(300);

    expect(setFieldValue).toHaveBeenCalledWith('title', 'New title');
    expect(revalidateOnChange).toHaveBeenCalledWith('title');
  });

  it('blocks overly long descriptions and flushes pending text fields on next', () => {
    const onNext = vi.fn();

    render(
      <BasicsSection
        categories={[]}
        levels={[]}
        labels={[]}
        cuisines={[]}
        servingUnits={[]}
        costLevels={[]}
        dietaryFlags={[]}
        allergens={[]}
        equipment={[]}
        onNext={onNext}
      />,
    );

    fireEvent.change(screen.getByTestId('recipe-basics-description'), {
      target: { value: 'x'.repeat(1000) },
    });

    expect(setFieldValue).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('recipe-basics-next'));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(setFieldValue).toHaveBeenCalledWith('title', 'Recipe title');
    expect(setFieldValue).toHaveBeenCalledWith('description', 'Recipe story');
  });

  it('updates number fields and select-based fields', () => {
    render(
      <BasicsSection
        categories={[{ value: 'dessert', label: 'Dessert' }]}
        levels={[{ value: 'easy', label: 'Easy' }]}
        labels={[]}
        cuisines={[{ value: 'italian', label: 'Italian' }]}
        servingUnits={[{ value: 'portion', label: 'portion' }]}
        costLevels={[{ value: 'budget', label: 'Budget' }]}
        dietaryFlags={[]}
        allergens={[]}
        equipment={[]}
        onNext={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByTestId('recipe-basics-prep-time'), {
      target: { value: '12' },
    });
    fireEvent.change(screen.getByTestId('recipe-basics-cooking-time'), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByTestId('recipe-basics-servings'), {
      target: { value: '6' },
    });

    expect(setFieldValue).toHaveBeenCalledWith('prepTimeMinutes', 12);
    expect(setFieldValue).toHaveBeenCalledWith('cookingTime', 45);
    expect(setFieldValue).toHaveBeenCalledWith('servings', 6);

    fireEvent.input(screen.getByTestId('recipe-basics-category'), {
      target: { value: 'dessert' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-difficulty'), {
      target: { value: 'easy' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-cuisine'), {
      target: { value: 'italian' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-cost-level'), {
      target: { value: 'budget' },
    });

    expect(setFieldValue).toHaveBeenCalledWith('category', {
      value: 'dessert',
      label: 'Dessert',
    });
    expect(setFieldValue).toHaveBeenCalledWith('difficultyLevel', {
      value: 'easy',
      label: 'Easy',
    });
    expect(setFieldValue).toHaveBeenCalledWith('cuisine', {
      value: 'italian',
      label: 'Italian',
    });
    expect(setFieldValue).toHaveBeenCalledWith('costLevel', {
      value: 'budget',
      label: 'Budget',
    });
  });

  it('updates multi-select fields and textareas', () => {
    render(
      <BasicsSection
        categories={[]}
        levels={[]}
        labels={[{ value: 'sweet', label: 'Sweet' }]}
        cuisines={[]}
        servingUnits={[]}
        costLevels={[]}
        dietaryFlags={[{ value: 'vegetarian', label: 'Vegetarian' }]}
        allergens={[{ value: 'nuts', label: 'Nuts' }]}
        equipment={[{ value: 'pan', label: 'Pan' }]}
        onNext={vi.fn()}
      />,
    );

    fireEvent.input(screen.getByTestId('recipe-basics-tags'), {
      target: { value: 'sweet' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-dietary-flags'), {
      target: { value: 'vegetarian' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-allergens'), {
      target: { value: 'nuts' },
    });
    fireEvent.input(screen.getByTestId('recipe-basics-equipment'), {
      target: { value: 'pan' },
    });
    fireEvent.change(screen.getByTestId('recipe-basics-tips'), {
      target: { value: 'Use fresh herbs' },
    });
    fireEvent.change(screen.getByTestId('recipe-basics-substitutions'), {
      target: { value: 'Swap for yogurt' },
    });

    expect(setFieldValue).toHaveBeenCalledWith('labels', ['sweet']);
    expect(setFieldValue).toHaveBeenCalledWith('dietaryFlags', ['vegetarian']);
    expect(setFieldValue).toHaveBeenCalledWith('allergens', ['nuts']);
    expect(setFieldValue).toHaveBeenCalledWith('equipment', ['pan']);
    expect(setFieldValue).toHaveBeenCalledWith('tips', 'Use fresh herbs');
    expect(setFieldValue).toHaveBeenCalledWith(
      'substitutions',
      'Swap for yogurt',
    );
  });
});
