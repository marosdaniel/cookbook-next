import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import RecipeDetailClient from './RecipeDetailClient';

const mocks = vi.hoisted(() => ({
  useRecipeDetail: vi.fn(),
}));

vi.mock('./hooks/useRecipeDetail', () => ({
  useRecipeDetail: () => mocks.useRecipeDetail(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      backToRecipes: 'Back to recipes',
      rateThisRecipe: 'Rate this recipe',
    };

    return translations[key] || key;
  },
}));

vi.mock('@/components/buttons/BackTo', () => ({
  BackTo: ({ text }: { text: string }) => <div>{text}</div>,
}));

vi.mock('@/components/Recipe/Rating', () => ({
  default: () => <div data-testid="recipe-rating" />,
}));

vi.mock('@/lib/seo/seo', () => ({
  buildRecipeJsonLd: (recipe: { title: string }) => ({
    '@context': 'https://schema.org',
    name: recipe.title,
  }),
}));

vi.mock('./components/RecipeHero', () => ({
  RecipeHero: ({ recipe }: { recipe: { title: string } }) => (
    <div data-testid="recipe-hero">{recipe.title}</div>
  ),
}));

vi.mock('./components/RecipeIngredients', () => ({
  RecipeIngredients: () => <div data-testid="recipe-ingredients" />,
}));

vi.mock('./components/RecipeNotFound', () => ({
  RecipeNotFound: ({ errorMessage }: { errorMessage?: string }) => (
    <div data-testid="recipe-not-found">{errorMessage ?? 'not found'}</div>
  ),
}));

vi.mock('./components/RecipeSteps', () => ({
  RecipeSteps: () => <div data-testid="recipe-steps" />,
}));

vi.mock('./components/RecipeVideo', () => ({
  RecipeVideo: () => <div data-testid="recipe-video" />,
}));

describe('RecipeDetailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading state while the recipe detail hook is loading', () => {
    mocks.useRecipeDetail.mockReturnValue({
      loading: true,
      error: undefined,
      recipe: undefined,
    });

    render(<RecipeDetailClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-detail-loading')).toBeInTheDocument();
  });

  it('renders the not found fallback when the hook reports an error', () => {
    mocks.useRecipeDetail.mockReturnValue({
      loading: false,
      error: { message: 'Boom' },
      recipe: undefined,
    });

    render(<RecipeDetailClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-not-found')).toHaveTextContent('Boom');
  });

  it('renders the full recipe detail content when the recipe is present', () => {
    mocks.useRecipeDetail.mockReturnValue({
      loading: false,
      error: undefined,
      recipe: {
        id: 'recipe-1',
        title: 'Pasta Primavera',
        ingredients: [],
        preparationSteps: [],
        rating: 0,
        averageRating: 4.2,
        ratingsCount: 8,
        userRating: null,
      },
      servingMultiplier: 1,
      adjustedServings: 4,
      checkedIngredients: new Set(),
      toggleIngredient: vi.fn(),
      incrementServings: vi.fn(),
      decrementServings: vi.fn(),
      youtubeId: 'abc123',
      isOwner: true,
      sortedSteps: [],
    });

    render(<RecipeDetailClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-detail-root')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-hero')).toHaveTextContent(
      'Pasta Primavera',
    );
    expect(screen.getByTestId('recipe-ingredients')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-steps')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-video')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-rating')).toBeInTheDocument();
  });
});
