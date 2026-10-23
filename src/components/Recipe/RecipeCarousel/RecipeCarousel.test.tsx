import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Box, Skeleton, Text } from '../../../../__mocks__/@mantine/core';
import RecipeCarousel from './RecipeCarousel';
import type { RecipeCarouselProps } from './types';

const { mockUseTranslations, mockEmblaApi } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(() => (key: string) => key),
  mockEmblaApi: {
    selectedScrollSnap: vi.fn(() => 1),
    scrollTo: vi.fn(),
    scrollSnapList: vi.fn(() => [0, 1]),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockEmblaApi.selectedScrollSnap.mockReturnValue(1);
  mockEmblaApi.scrollSnapList.mockReturnValue([0, 1]);
});

vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
}));

vi.mock('@mantine/carousel', () => {
  const MockCarousel = ({
    children,
    emblaOptions,
    getEmblaApi,
    slideSize,
    ...props
  }: ComponentProps<'div'> & {
    emblaOptions?: { loop?: boolean };
    getEmblaApi?: (api: never) => void;
    slideSize?: { lg?: string };
  }) => (
    <>
      <div
        {...props}
        data-loop={emblaOptions?.loop}
        data-slide-size-lg={slideSize?.lg}
      >
        {children}
      </div>
      {getEmblaApi && <EmblaApiSetter getEmblaApi={getEmblaApi} />}
    </>
  );
  MockCarousel.Slide = ({ children, ...props }: ComponentProps<'div'>) => (
    <div {...props}>{children}</div>
  );

  return { Carousel: MockCarousel };
});

const EmblaApiSetter = ({
  getEmblaApi,
}: {
  getEmblaApi: (api: never) => void;
}) => {
  useEffect(() => {
    getEmblaApi(mockEmblaApi as never);
  }, [getEmblaApi]);

  return null;
};

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
  RecipeCard: ({
    recipe,
    withTransitions,
  }: {
    recipe: { id: string; title: string };
    withTransitions?: boolean;
  }) => (
    <div
      data-testid={`recipe-card-${recipe.id}`}
      data-with-transitions={String(withTransitions ?? true)}
    >
      {recipe.title}
    </div>
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
    expect(screen.getByTestId('recipe-carousel')).toHaveAttribute(
      'data-loop',
      'true',
    );
    expect(screen.getByTestId('recipe-carousel')).toHaveAttribute(
      'data-slide-size-lg',
      '60%',
    );
    expect(
      screen.getByRole('button', { name: 'nextRecipe' }),
    ).toBeInTheDocument();
  });

  it('wraps to the first snap when the next control is clicked at the end', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} />);

    const nextControl = screen.getByRole('button', { name: 'nextRecipe' });
    expect(nextControl).toBeEnabled();

    fireEvent.click(nextControl);

    expect(mockEmblaApi.scrollTo).toHaveBeenCalledWith(0);
  });

  it('keeps smaller carousels wide enough to have scroll snaps', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
      { id: 'recipe-3', title: 'Recipe three' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} />);

    expect(screen.getByTestId('recipe-carousel')).toHaveAttribute(
      'data-slide-size-lg',
      '45%',
    );
  });

  it('renders a static desktop grid when enabled for two recipes', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} staticOnDesktop />);

    expect(
      screen.getByTestId('recipe-carousel-static-grid'),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('recipe-carousel-slide')).toHaveLength(2);
  });

  it('disables view transitions on the carousel copy when the static grid is shown', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} staticOnDesktop />);

    for (const slide of screen.getAllByTestId('recipe-carousel-slide')) {
      expect(
        slide.querySelector('[data-with-transitions="false"]'),
      ).toBeInTheDocument();
    }
  });

  it('keeps view transitions on the carousel when no static grid is shown', () => {
    const recipes: NonNullable<RecipeCarouselProps['recipes']> = [
      { id: 'recipe-1', title: 'Recipe one' } as never,
      { id: 'recipe-2', title: 'Recipe two' } as never,
      { id: 'recipe-3', title: 'Recipe three' } as never,
    ];

    render(<RecipeCarousel recipes={recipes} staticOnDesktop />);

    expect(
      screen.queryByTestId('recipe-carousel-static-grid'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('recipe-card-recipe-1')).toHaveAttribute(
      'data-with-transitions',
      'true',
    );
  });
});
