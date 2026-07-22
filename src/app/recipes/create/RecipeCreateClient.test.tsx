import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import RecipeCreateClient from './RecipeCreateClient';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useRecipeMetadata: vi.fn(),
  useRecipeForm: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.useSession(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mocks.redirect(url),
}));

vi.mock('@/components/Recipe/Create/hooks/useRecipeMetadata', () => ({
  useRecipeMetadata: () => mocks.useRecipeMetadata(),
}));

vi.mock('@/components/Recipe/Create/hooks/useRecipeForm', () => ({
  useRecipeForm: () => mocks.useRecipeForm(),
}));

vi.mock('@/components/Recipe/Create/RecipeComposer', () => ({
  default: ({ headerTitle }: { headerTitle: string }) => (
    <div data-testid="recipe-composer">{headerTitle}</div>
  ),
}));

describe('RecipeCreateClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading state while the session is loading', () => {
    mocks.useSession.mockReturnValue({ data: null, status: 'loading' });
    mocks.useRecipeMetadata.mockReturnValue({
      labels: [],
      metadataLoaded: true,
    });
    mocks.useRecipeForm.mockReturnValue({
      form: {},
      handlePublish: vi.fn(),
      publishLoading: false,
      completion: { done: 1, total: 2, percent: 50 },
      lastSavedLabel: 'Last saved',
      saveDraftNow: vi.fn(),
      resetDraft: vi.fn(),
      addIngredient: vi.fn(),
      addStep: vi.fn(),
    });

    render(<RecipeCreateClient />);

    expect(screen.getByTestId('recipe-create-loading')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to sign-in and renders nothing else', () => {
    mocks.useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mocks.useRecipeMetadata.mockReturnValue({
      labels: [],
      metadataLoaded: true,
    });

    render(<RecipeCreateClient />);

    expect(mocks.redirect).toHaveBeenCalledWith('/api/auth/signin');
    expect(screen.queryByTestId('recipe-composer')).not.toBeInTheDocument();
  });

  it('renders the composer for an authenticated user', () => {
    mocks.useSession.mockReturnValue({
      data: { user: { id: 'user-1' } },
      status: 'authenticated',
    });
    mocks.useRecipeMetadata.mockReturnValue({
      labels: [],
      metadataLoaded: true,
    });
    mocks.useRecipeForm.mockReturnValue({
      form: {},
      handlePublish: vi.fn(),
      publishLoading: false,
      completion: { done: 1, total: 2, percent: 50 },
      lastSavedLabel: 'Last saved',
      saveDraftNow: vi.fn(),
      resetDraft: vi.fn(),
      addIngredient: vi.fn(),
      addStep: vi.fn(),
    });

    render(<RecipeCreateClient />);

    expect(screen.getByTestId('recipe-composer')).toBeInTheDocument();
  });
});
