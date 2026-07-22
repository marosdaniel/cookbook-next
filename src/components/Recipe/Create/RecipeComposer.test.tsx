import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ActionIcon,
  Box,
  Drawer,
  Group,
  LoadingOverlay,
  ScrollArea,
} from '../../../../__mocks__/@mantine/core';
import RecipeComposer from './RecipeComposer';

const mockUseRecipeMetadata = vi.fn();
const mockUseRouter = vi.fn();

vi.mock('@mantine/core', () => ({
  ActionIcon: ActionIcon,
  Box: Box,
  Drawer: Drawer,
  Group: Group,
  LoadingOverlay: LoadingOverlay,
  ScrollArea: ScrollArea,
}));

vi.mock('@mantine/hooks', () => ({
  useDebouncedValue: (value: unknown) => [value],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('./components/ComposerHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="composer-header">{title}</div>
  ),
}));

vi.mock('./components/ComposerSidebar', () => ({
  default: () => <div data-testid="composer-sidebar" />,
}));

vi.mock('./hooks/useRecipeMetadata', () => ({
  useRecipeMetadata: () => mockUseRecipeMetadata(),
}));

vi.mock('./Preview', () => ({
  default: () => <div data-testid="preview-pane" />,
}));

vi.mock('./sections/BasicsSection', () => ({
  default: () => <div data-testid="basics-section" />,
}));

vi.mock('./sections/IngredientsSection', () => ({
  default: () => <div data-testid="ingredients-section" />,
}));

vi.mock('./sections/MediaSection', () => ({
  default: () => <div data-testid="media-section" />,
}));

vi.mock('./sections/StepsSection', () => ({
  default: () => <div data-testid="steps-section" />,
}));

const createForm = () => ({
  values: {
    title: 'Recipe',
    description: 'Story',
    imgSrc: '',
    servings: 4,
    cookingTime: 30,
    difficultyLevel: { value: 'easy', label: 'Easy' },
    category: { value: 'dessert', label: 'Dessert' },
    labels: [],
    youtubeLink: '',
    ingredients: [],
    preparationSteps: [],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    restTimeMinutes: 5,
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
  },
  onSubmit: (handler: unknown) => handler,
});

describe('RecipeComposer', () => {
  beforeEach(() => {
    mockUseRouter.mockReset();
    mockUseRouter.mockReturnValue({ back: vi.fn() });
    mockUseRecipeMetadata.mockReset();
    mockUseRecipeMetadata.mockReturnValue({
      categories: [],
      levels: [],
      labels: [],
      unitOptions: [],
      cuisines: [],
      servingUnits: [],
      dietaryFlags: [],
      allergens: [],
      equipment: [],
      costLevels: [],
      metadataLoading: false,
      metadataLoaded: true,
    });
  });

  it('renders the composer shell and the default basics section', () => {
    render(
      <RecipeComposer
        form={createForm() as never}
        handlePublish={vi.fn()}
        submitLoading={false}
        completion={{ done: 2, total: 4, percent: 50 }}
        lastSavedLabel="Saved"
        onSave={vi.fn()}
        onReset={vi.fn()}
        addIngredient={vi.fn()}
        addStep={vi.fn()}
        headerTitle="Create recipe"
        submitLabel="Publish"
        resetLabel="Reset"
        mode="create"
        goToSectionRef={{ current: null }}
      />,
    );

    expect(screen.getByTestId('recipe-composer')).toBeInTheDocument();
    expect(screen.getByTestId('composer-header')).toHaveTextContent(
      'Create recipe',
    );
    expect(screen.getByTestId('basics-section')).toBeInTheDocument();
  });

  it('shows the loading overlay while metadata is loading', () => {
    mockUseRecipeMetadata.mockReturnValue({
      ...mockUseRecipeMetadata.mock.results[0]?.value,
      metadataLoading: true,
      metadataLoaded: false,
    });

    render(
      <RecipeComposer
        form={createForm() as never}
        handlePublish={vi.fn()}
        submitLoading={false}
        completion={{ done: 1, total: 4, percent: 25 }}
        lastSavedLabel="Saved"
        onSave={vi.fn()}
        onReset={vi.fn()}
        addIngredient={vi.fn()}
        addStep={vi.fn()}
        headerTitle="Create recipe"
        submitLabel="Publish"
        resetLabel="Reset"
        mode="create"
        goToSectionRef={{ current: null }}
      />,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });
});
