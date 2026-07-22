import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import RecipesPage from './RecipesPage';

const mocks = vi.hoisted(() => ({
  useQuery: vi.fn(),
  useCategories: vi.fn(),
  useLevels: vi.fn(),
  useLabels: vi.fn(),
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
}));

vi.mock('@/lib/store/metadata', () => ({
  useCategories: () => mocks.useCategories(),
  useLevels: () => mocks.useLevels(),
  useLabels: () => mocks.useLabels(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mocks.useRouter(),
  usePathname: () => mocks.usePathname(),
  useSearchParams: () => mocks.useSearchParams(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/Recipe/Create/utils', () => ({
  toCleanedOptions: (options: Array<{ key: string; label: string }>) =>
    options.map((option) => ({ value: option.key, label: option.label })),
}));

vi.mock('@/components/Recipe/RecipeCard', () => ({
  RecipeGrid: ({
    loading,
    recipes,
  }: {
    loading: boolean;
    recipes: Array<{ id: string }>;
  }) => (
    <div data-testid="recipe-grid">
      {loading
        ? 'loading-grid'
        : recipes.length
          ? 'grid-content'
          : 'empty-grid'}
    </div>
  ),
}));

vi.mock('@/components/Recipe/RecipeCarousel', () => ({
  RecipeCarousel: ({
    loading,
    recipes,
  }: {
    loading: boolean;
    recipes: Array<{ id: string }>;
  }) => (
    <div data-testid="recipe-carousel">
      {loading
        ? 'loading-carousel'
        : recipes.length
          ? 'carousel-content'
          : 'empty-carousel'}
    </div>
  ),
}));

vi.mock('@/components/Recipe/RecipeSearch', async () => {
  const actual = await vi.importActual<
    typeof import('@/components/Recipe/RecipeSearch')
  >('@/components/Recipe/RecipeSearch');
  return {
    ...actual,
    default: ({ onSearch }: { onSearch: (filters: unknown) => void }) => (
      <button
        type="button"
        onClick={() =>
          onSearch({
            title: 'pasta',
            categoryKey: null,
            difficultyLevelKey: null,
            labelKeys: [],
            maxCookingTime: '',
          })
        }
      >
        search
      </button>
    ),
  };
});

describe('RecipesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useRouter.mockReturnValue({ replace: vi.fn() });
    mocks.usePathname.mockReturnValue('/recipes');
    mocks.useSearchParams.mockReturnValue(new URLSearchParams());
    mocks.useCategories.mockReturnValue([]);
    mocks.useLevels.mockReturnValue([]);
    mocks.useLabels.mockReturnValue([]);
  });

  it('renders the browse page and the carousel state for the recent recipes list', () => {
    mocks.useQuery.mockReturnValue({
      data: { getRecipes: { recipes: [{ id: '1' }], totalRecipes: 1 } },
      loading: false,
    });

    render(<RecipesPage />);

    expect(screen.getByTestId('recipe-page-root')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-carousel')).toHaveTextContent(
      'carousel-content',
    );
    expect(screen.getByText('recentlyAdded')).toBeInTheDocument();
  });

  it('shows the search results state when the URL contains active filters', () => {
    mocks.useSearchParams.mockReturnValue(new URLSearchParams('q=pasta'));
    mocks.useQuery.mockReturnValue({
      data: { getRecipes: { recipes: [{ id: '1' }], totalRecipes: 1 } },
      loading: false,
    });

    render(<RecipesPage />);

    expect(
      screen.getByTestId('recipe-search-results-section'),
    ).toBeInTheDocument();
    expect(screen.getByText('searchResults')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-grid')).toHaveTextContent('grid-content');
  });

  it('renders loading states while the recipe query is running', () => {
    mocks.useQuery.mockReturnValue({ data: undefined, loading: true });

    render(<RecipesPage />);

    expect(screen.getByTestId('recipe-carousel')).toHaveTextContent(
      'loading-carousel',
    );
  });

  it('renders the empty recent recipes state when there are no results', () => {
    mocks.useQuery.mockReturnValue({
      data: { getRecipes: { recipes: [], totalRecipes: 0 } },
      loading: false,
    });

    render(<RecipesPage />);

    expect(screen.getByText('noRecipes')).toBeInTheDocument();
  });

  it('submits search filters through the router when the mocked search control is used', () => {
    const replace = vi.fn();
    mocks.useRouter.mockReturnValue({ replace });
    mocks.useQuery.mockReturnValue({
      data: { getRecipes: { recipes: [], totalRecipes: 0 } },
      loading: false,
    });

    render(<RecipesPage />);

    fireEvent.click(screen.getByRole('button', { name: 'search' }));

    expect(replace).toHaveBeenCalledWith('/recipes?q=pasta', { scroll: false });
  });
});
