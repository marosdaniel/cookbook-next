import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import RecipeEditClient from './RecipeEditClient';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  useSession: vi.fn(),
  useQuery: vi.fn(),
  useRecipeEditForm: vi.fn(),
  useRecipeMetadata: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => mocks.useQuery(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      failedToLoad: 'Failed to load recipe',
      notFoundTitle: 'Recipe not found',
      notFoundMessage: 'The recipe you are looking for does not exist.',
      notAuthorizedTitle: 'Not authorized',
      notAuthorizedMessage: 'You do not have permission to edit this recipe.',
      lastSavedLabel: 'Last saved',
      headerTitle: 'Edit recipe',
      submitLabel: 'Save recipe',
      resetLabel: 'Reset changes',
    };

    return translations[key] || key;
  },
}));

vi.mock('@/components/Recipe/Create/hooks/useRecipeEditForm', () => ({
  useRecipeEditForm: () => mocks.useRecipeEditForm(),
}));

vi.mock('@/components/Recipe/Create/hooks/useRecipeMetadata', () => ({
  useRecipeMetadata: () => mocks.useRecipeMetadata(),
}));

type RecipeComposerMockProps = {
  onSave?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  headerTitle?: string;
};

vi.mock('@/components/Recipe/Create/RecipeComposer', () => ({
  default: ({
    onSave,
    submitLabel,
    resetLabel,
    headerTitle,
  }: RecipeComposerMockProps) => (
    <div data-testid="recipe-edit-composer">
      <h2>{headerTitle}</h2>
      <button type="button" onClick={onSave}>
        {submitLabel}
      </button>
      <button type="button">{resetLabel}</button>
    </div>
  ),
}));

vi.mock('@/components/Recipe/Create/utils', () => ({
  EMPTY_FORM_VALUES: {
    title: '',
    description: '',
    category: '',
    ingredients: [],
    steps: [],
  },
  recipeToFormValues: (recipe: { id: string }) => ({
    title: recipe.id,
    description: '',
    category: '',
    ingredients: [],
    steps: [],
  }),
}));

vi.mock('@/lib/graphql/queries', () => ({
  GET_RECIPE_BY_ID: 'GET_RECIPE_BY_ID',
}));

describe('RecipeEditClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useRecipeMetadata.mockReturnValue({ labels: {} });
    mocks.useRecipeEditForm.mockReturnValue({
      form: {
        onSubmit: vi.fn(() => vi.fn()),
      },
      handlePublish: vi.fn(),
      submitLoading: false,
      completion: 0,
      resetToOriginal: vi.fn(),
      addIngredient: vi.fn(),
      addStep: vi.fn(),
    });
  });

  it('renders the loading overlay while auth or recipe data is loading', () => {
    mocks.useSession.mockReturnValue({ data: null, status: 'loading' });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-edit-loading')).toBeInTheDocument();
  });

  it('redirects to the sign-in route when the user is unauthenticated', () => {
    mocks.useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    expect(mocks.replace).toHaveBeenCalledWith('/api/auth/signin');
  });

  it('renders the error state when loading the recipe fails', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: { message: 'Request failed' },
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-edit-error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to load recipe')).toBeInTheDocument();
    expect(screen.getByText('Request failed')).toBeInTheDocument();
  });

  it('renders the not-found state when the recipe is missing', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: null },
      loading: false,
      error: undefined,
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-edit-not-found')).toBeInTheDocument();
    expect(screen.getByText('Recipe not found')).toBeInTheDocument();
  });

  it('renders the unauthorized state when the current user is not the owner', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-2' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: { id: 'recipe-1', createdBy: 'user-1' } },
      loading: false,
      error: undefined,
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    expect(screen.getByTestId('recipe-edit-unauthorized')).toBeInTheDocument();
    expect(screen.getByText('Not authorized')).toBeInTheDocument();
  });

  it('renders the composer and wires the save handler for the recipe owner', () => {
    const handlePublish = vi.fn();
    const submitHandler = vi.fn();

    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
    mocks.useQuery.mockReturnValue({
      data: { getRecipeById: { id: 'recipe-1', createdBy: 'user-1' } },
      loading: false,
      error: undefined,
    });
    mocks.useRecipeEditForm.mockReturnValue({
      form: {
        onSubmit: vi.fn(() => submitHandler),
      },
      handlePublish,
      submitLoading: false,
      completion: 0,
      resetToOriginal: vi.fn(),
      addIngredient: vi.fn(),
      addStep: vi.fn(),
    });

    render(<RecipeEditClient recipeId="recipe-1" />);

    fireEvent.click(screen.getByRole('button', { name: 'Save recipe' }));

    expect(screen.getByTestId('recipe-edit-composer')).toBeInTheDocument();
    expect(submitHandler).toHaveBeenCalledTimes(1);
  });
});
