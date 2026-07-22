import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import RecipeDetailPage from './page';

const mocks = vi.hoisted(() => ({
  getRecipeBySlugOrId: vi.fn(),
  getLocaleFromCookies: vi.fn(),
  getMetadata: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new Error(`redirect:${url}`);
  },
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: () => mocks.getLocaleFromCookies(),
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: () => mocks.getMetadata(),
}));

vi.mock('@/lib/services/RecipeService', () => ({
  RecipeService: {
    getRecipeBySlugOrId: () => mocks.getRecipeBySlugOrId(),
  },
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('./RecipeDetailClient', () => ({
  default: ({ recipeId }: { recipeId: string }) => (
    <div data-testid="recipe-detail-client">{recipeId}</div>
  ),
}));

describe('RecipeDetailPage', () => {
  it('redirects to the canonical slug URL when a slug is present', async () => {
    mocks.getLocaleFromCookies.mockResolvedValue('en');
    mocks.getMetadata.mockResolvedValue({
      title: 'Recipe Details',
      description: 'Test description',
      keywords: ['recipe'],
    });
    mocks.getRecipeBySlugOrId.mockResolvedValue({
      slug: 'pasta',
      id: 'recipe-1',
    });

    await expect(
      RecipeDetailPage({
        params: Promise.resolve({ id: 'recipe-1' }),
      } as never),
    ).rejects.toThrow('redirect:/recipes/pasta');

    expect(mocks.redirect).toHaveBeenCalledWith('/recipes/pasta');
  });

  it('renders the detail client for the matched recipe id', async () => {
    mocks.getLocaleFromCookies.mockResolvedValue('en');
    mocks.getMetadata.mockResolvedValue({
      title: 'Recipe Details',
      description: 'Test description',
      keywords: ['recipe'],
    });
    mocks.getRecipeBySlugOrId.mockResolvedValue({
      slug: 'recipe-1',
      id: 'recipe-1',
    });

    const result = await RecipeDetailPage({
      params: Promise.resolve({ id: 'recipe-1' }),
    } as never);

    expect(result).toBeTruthy();
  });
});
