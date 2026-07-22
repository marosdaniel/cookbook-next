import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/utils/test-utils';

const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mockUseQuery(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      latestRecipes: 'Latest Recipes',
      carouselEmpty: 'No recipes yet',
      recentlyViewed: 'Recently viewed',
      recentlyViewedHint: 'Your recent picks appear here',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/components/Recipe/RecipeCarousel', () => ({
  RecipeCarousel: ({
    loading,
    recipes,
    emptyMessage,
  }: {
    loading?: boolean;
    recipes?: unknown[];
    emptyMessage?: string;
  }) => (
    <div data-testid="recipe-carousel">
      <span data-testid="recipe-carousel-loading">
        {loading ? 'loading' : 'loaded'}
      </span>
      <span data-testid="recipe-carousel-count">{recipes?.length ?? 0}</span>
      <span data-testid="recipe-carousel-empty">
        {emptyMessage ?? 'no-message'}
      </span>
    </div>
  ),
}));

import HomePage from './HomePage';

describe('HomePage', () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it('renders the home page sections and the latest recipes content', () => {
    mockUseQuery.mockReturnValue({
      data: { getRecipes: { recipes: [{ id: '1' }] } },
      loading: false,
    });

    render(<HomePage />);

    expect(screen.getByTestId('home-page-root')).toBeInTheDocument();
    expect(screen.getByTestId('latest-recipes-section')).toBeInTheDocument();
    expect(screen.getByTestId('recently-viewed-section')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    const latestRecipeCarousel = screen.getAllByTestId('recipe-carousel')[0];
    expect(
      within(latestRecipeCarousel).getByTestId('recipe-carousel-count'),
    ).toHaveTextContent('1');
    expect(
      within(latestRecipeCarousel).getByTestId('recipe-carousel-loading'),
    ).toHaveTextContent('loaded');
  });

  it('renders the loading state for the latest recipes carousel', () => {
    mockUseQuery.mockReturnValue({ data: undefined, loading: true });

    render(<HomePage />);

    const latestRecipeCarousel = screen.getAllByTestId('recipe-carousel')[0];
    expect(
      within(latestRecipeCarousel).getByTestId('recipe-carousel-loading'),
    ).toHaveTextContent('loading');
    expect(
      within(latestRecipeCarousel).getByTestId('recipe-carousel-count'),
    ).toHaveTextContent('0');
  });

  it('renders the empty state message when no recipes are returned', () => {
    mockUseQuery.mockReturnValue({
      data: { getRecipes: { recipes: [] } },
      loading: false,
    });

    render(<HomePage />);

    const latestRecipeCarousel = screen.getAllByTestId('recipe-carousel')[0];
    expect(
      within(latestRecipeCarousel).getByTestId('recipe-carousel-empty'),
    ).toHaveTextContent('No recipes yet');
  });
});
