import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ButtonProps,
  DivProps,
  InputProps,
  ParagraphProps,
  TextareaProps,
} from '../../../../../types/test';
import MediaSection from './MediaSection';

vi.mock('@mantine/core', () => ({
  ActionIcon: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  Badge: ({ children, ...props }: ParagraphProps) => (
    <span {...props}>{children}</span>
  ),
  Box: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  Group: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Image: ({
    alt,
    ...props
  }: React.ComponentPropsWithoutRef<'img'> & {
    alt?: string;
    [key: string]: unknown;
  }) => <img alt={alt as string | undefined} {...props} />,
  Paper: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Stack: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: ParagraphProps) => (
    <p {...props}>{children}</p>
  ),
  Textarea: ({ value, onChange, ...props }: TextareaProps) => (
    <textarea
      value={value}
      onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      {...props}
    />
  ),
  TextInput: ({
    value,
    onChange,
    rightSection,
    leftSection,
    ...props
  }: InputProps & {
    rightSection?: React.ReactNode;
    leftSection?: React.ReactNode;
  }) => (
    <div>
      <input
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        {...props}
      />
      {leftSection}
      {rightSection}
    </div>
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

describe('MediaSection', () => {
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

  it('renders the section shell and the expected inputs', () => {
    render(<MediaSection onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByTestId('recipe-media-section')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-media-cover-url')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-media-youtube-url')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-media-slug')).toBeInTheDocument();
  });

  it('shows the image preview when a cover image is present', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({ imgSrc: 'https://example.com/cover.jpg' }),
      setFieldValue,
      errors: {},
    });

    render(<MediaSection onBack={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByAltText('coverPreview')).toBeInTheDocument();
  });

  it('clears the cover image and revalidates the field', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({ imgSrc: 'https://example.com/cover.jpg' }),
      setFieldValue,
      errors: {},
    });

    render(<MediaSection onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.click(screen.getByTestId('recipe-media-clear-cover-image'));

    expect(setFieldValue).toHaveBeenCalledWith('imgSrc', '');
    expect(revalidateOnChange).toHaveBeenCalledWith('imgSrc');
  });

  it('regenerates the slug from the current title', () => {
    mockUseRecipeFormContext.mockReturnValue({
      values: createFormValues({ title: 'My Fancy Recipe' }),
      setFieldValue,
      errors: {},
    });

    render(<MediaSection onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.click(screen.getByTestId('recipe-media-regenerate-slug'));

    expect(setFieldValue).toHaveBeenCalledWith('slug', 'my-fancy-recipe');
    expect(revalidateOnChange).toHaveBeenCalledWith('slug');
  });

  it('updates a text field and revalidates it on change', () => {
    render(<MediaSection onBack={vi.fn()} onNext={vi.fn()} />);

    fireEvent.change(screen.getByTestId('recipe-media-youtube-url'), {
      target: { value: 'https://youtu.be/demo' },
    });

    expect(setFieldValue).toHaveBeenCalledWith(
      'youtubeLink',
      'https://youtu.be/demo',
    );
    expect(revalidateOnChange).toHaveBeenCalledWith('youtubeLink');
  });

  it('calls the handlers for back and next actions', () => {
    const onBack = vi.fn();
    const onNext = vi.fn();

    render(<MediaSection onBack={onBack} onNext={onNext} />);

    fireEvent.click(screen.getByRole('button', { name: 'back' }));
    fireEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
