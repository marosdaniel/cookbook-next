import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
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
  buildRecipeJsonLd: (recipe: { title: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
  }),
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
    Suspense: ({ children }: { children: ReactNode }) => <>{children}</>,
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
      preparationSteps: [],
    });

    const result = await RecipeDetailPage({
      params: Promise.resolve({ id: 'recipe-1' }),
    } as never);

    expect(result).toBeTruthy();
  });

  it('renders server recipe data as initial client data and JSON-LD', async () => {
    mocks.getRecipeBySlugOrId.mockResolvedValue({
      id: 'recipe-1',
      slug: 'recipe-1',
      title: 'Pasta Primavera',
      description: 'Fresh pasta',
      ingredients: [],
      preparationSteps: [{ id: 'step-1', description: 'Boil pasta', order: 1 }],
      category: { key: 'main', label: 'Main' },
      difficultyLevel: { key: 'easy', label: 'Easy' },
      labels: [],
      cookingTime: 20,
      servings: 2,
      createdBy: 'user-1',
    });

    const result = await RecipeDetailPage({
      params: Promise.resolve({ id: 'recipe-1' }),
    } as never);
    const html = JSON.stringify(result);

    expect(html).toContain('application/ld+json');
    expect(html).toContain('Pasta Primavera');
    expect(html).toContain('initialRecipe');
  });
});
