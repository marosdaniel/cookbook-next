import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Box, Skeleton, Text } from '../../../../__mocks__/@mantine/core.tsx';
import RecipeCarousel from './RecipeCarousel';
import type { RecipeCarouselProps } from './types';

const { mockUseTranslations } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
}));

vi.mock('@mantine/carousel', () => {
  const MockCarousel = ({ children, ...props }: ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  );
  MockCarousel.Slide = ({ children, ...props }: ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  );

  return { Carousel: MockCarousel };
});

vi.mock('@mantine/core', () => ({
  Box: Box,
  Skeleton: Skeleton,
  Text: Text,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../RecipeCard', () => ({
  RecipeCard: ({ recipe }: { recipe: { id: string; title: string } }) => (
    <div data-testid={`recipe-card-${recipe.id}`}>{recipe.title}</div>
  ),
}));

describe('RecipeCarousel', () => {
  it('renders the loading state with the requested number of skeleton slides', () => {
    render(<RecipeCarousel recipes={[]} loading skeletonCount={2} />);

    expect(screen.getAllByTestId('recipe-carousel-skeleton')).toHaveLength(2);
    expect(screen.getByTestId('recipe-carousel')).toBeInTheDocument();
  });

  it('renders the empty state with the provided fallback message', () => {
    render(<RecipeCarousel recipes={[]} emptyMessage="No recipes yet" />);

    expect(screen.getByTestId('recipe-carousel-empty')).toBeInTheDocument();
    expect(screen.getByText('No recipes yet')).toBeInTheDocument();
  });

  it('renders the content state with one slide per recipe', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} />);

    expect(screen.getByTestId('recipe-carousel-content')).toBeInTheDocument();
    expect(screen.getAllByTestId('recipe-carousel-slide')).toHaveLength(2);
    expect(screen.getByText('Recipe one')).toBeInTheDocument();
    expect(screen.getByText('Recipe two')).toBeInTheDocument();
  });
});
