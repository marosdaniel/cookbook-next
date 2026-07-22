import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '../../../../../../__mocks__/@mantine/core';
import MediaSection from './MediaSection';

vi.mock('@mantine/core', () => ({
  ActionIcon: ActionIcon,
  Badge: Badge,
  Box: Box,
  Button: Button,
  Group: Group,
  Image: Image,
  Paper: Paper,
  Stack: Stack,
  Text: Text,
  Textarea: Textarea,
  TextInput: TextInput,
  ThemeIcon: ThemeIcon,
  Title: Title,
  Tooltip: Tooltip,
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

    expect(
      screen.getByRole('img', { name: 'coverPreview' }),
    ).toBeInTheDocument();
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
