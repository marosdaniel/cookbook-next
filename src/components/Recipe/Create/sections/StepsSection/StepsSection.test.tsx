import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ButtonProps,
  DivProps,
  ParagraphProps,
  TextareaProps,
} from '../../../../../types/test';
import StepsSection from './StepsSection';

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
  Tooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  LayoutGroup: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
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

vi.mock('../../utils', () => ({
  getPublishButtonState: vi.fn(() => ({ disabled: false, missingFields: [] })),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const createFormValues = (
  overrides: Partial<Record<string, unknown>> = {},
) => ({
  title: 'Recipe title',
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

describe('StepsSection', () => {
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

  it('renders the empty state and calls add', () => {
    const onAdd = vi.fn();

    render(
      <StepsSection
        onAdd={onAdd}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Publish"
      />,
    );

    expect(screen.getByTestId('recipe-steps-section')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('recipe-steps-add'));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('edits, reorders, and removes steps', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({
        preparationSteps: [
          { localId: 'step-1', description: 'First step', order: 1 },
          { localId: 'step-2', description: 'Second step', order: 2 },
        ],
      }),
      setFieldValue,
      errors: {},
    });

    render(
      <StepsSection
        onAdd={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitLabel="Publish"
      />,
    );

    const textareas = screen.getAllByTestId('recipe-step-textarea');
    fireEvent.change(textareas[0], { target: { value: 'Updated first step' } });
    fireEvent.click(screen.getAllByTestId('recipe-step-move-down')[0]);
    fireEvent.click(screen.getAllByTestId('recipe-step-remove')[0]);

    expect(setFieldValue).toHaveBeenCalledWith('preparationSteps', [
      { localId: 'step-2', description: 'Second step', order: 1 },
    ]);
    expect(revalidateOnChange).toHaveBeenCalledWith(
      'preparationSteps[0].description',
    );
  });

  it('submits and respects disabled publish state', async () => {
    const onSubmit = vi.fn();
    const { getPublishButtonState } = await import('../../utils');
    vi.mocked(getPublishButtonState).mockReturnValue({
      disabled: true,
      missingFields: ['title'],
    });

    render(
      <StepsSection
        onAdd={vi.fn()}
        onBack={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitLabel="Publish"
      />,
    );

    fireEvent.click(screen.getByTestId('recipe-steps-publish'));
    expect(screen.getByTestId('recipe-steps-publish')).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
