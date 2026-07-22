import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import MyRecipesClient from './MyRecipesClient';

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
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/components/Recipe/RecipeCard', () => ({
  RecipeGrid: ({ recipes }: { recipes: Array<{ id: string }> }) => (
    <div data-testid="recipe-grid">
      {recipes.length ? 'grid-content' : 'empty-grid'}
    </div>
  ),
}));

describe('MyRecipesClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
  });

  it('renders the loading skeleton state while the recipes are loading', () => {
    mocks.useQuery.mockReturnValue({ data: undefined, loading: true });

    render(<MyRecipesClient />);

    expect(screen.getByTestId('my-recipes-loading')).toBeInTheDocument();
  });

  it('shows the empty state and create action when the user has no recipes yet', () => {
    mocks.useQuery.mockReturnValue({
      data: { getRecipesByUserId: { recipes: [], totalRecipes: 0 } },
      loading: false,
    });

    render(<MyRecipesClient />);

    expect(screen.getByTestId('my-recipes-empty')).toBeInTheDocument();
    expect(screen.getByTestId('my-recipes-create-button')).toBeInTheDocument();
    expect(screen.getByText('noMyRecipesYet')).toBeInTheDocument();
  });

  it('renders the stats and recipe grid when recipes exist', () => {
    mocks.useQuery.mockReturnValue({
      data: {
        getRecipesByUserId: {
          recipes: [{ id: '1', averageRating: 4.2, ratingsCount: 3 }],
          totalRecipes: 1,
        },
      },
      loading: false,
    });

    render(<MyRecipesClient />);

    expect(screen.getByTestId('my-recipes-page')).toBeInTheDocument();
    expect(screen.getByTestId('my-recipes-stats')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-grid')).toHaveTextContent('grid-content');
  });
});
