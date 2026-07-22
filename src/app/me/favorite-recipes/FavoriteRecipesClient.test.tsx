import '@testing-library/jest-dom';
import type { AnchorHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import FavoriteRecipesClient from './FavoriteRecipesClient';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useQuery: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}));

vi.mock('@/components/Recipe/RecipeCard', () => ({
  RecipeGrid: ({ recipes }: { recipes: Array<{ id: string }> }) => (
    <div data-testid="recipe-grid">
      {recipes.length ? 'grid-content' : 'empty-grid'}
    </div>
  ),
}));

describe('FavoriteRecipesClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
  });

  it('renders the loading skeleton state while the favorite recipes are loading', () => {
    mocks.useQuery.mockReturnValue({ data: undefined, loading: true });

    render(<FavoriteRecipesClient />);

    expect(screen.getByTestId('favorite-recipes-loading')).toBeInTheDocument();
  });

  it('shows the empty state and browse link when the user has no favorites', () => {
    mocks.useQuery.mockReturnValue({
      data: { getFavoriteRecipes: [] },
      loading: false,
    });

    render(<FavoriteRecipesClient />);

    expect(screen.getByTestId('favorite-recipes-empty')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-recipes-browse')).toBeInTheDocument();
    expect(screen.getByText('noFavoriteRecipesYet')).toBeInTheDocument();
  });

  it('renders the favorite recipes content and stats when favorites exist', () => {
    mocks.useQuery.mockReturnValue({
      data: {
        getFavoriteRecipes: [
          { id: '1', averageRating: 4.5 },
          { id: '2', averageRating: 0 },
        ],
      },
      loading: false,
    });

    render(<FavoriteRecipesClient />);

    expect(screen.getByTestId('favorite-recipes-page')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-recipes-stats')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-grid')).toHaveTextContent('grid-content');
  });
});
