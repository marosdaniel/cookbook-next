import { describe, expect, it, vi } from 'vitest';
import * as locale from '@/lib/locale/locale';
import type { LocaleMessages } from '@/types/common';
import type { RecipeDetail } from '@/types/recipe';
import { buildRecipeJsonLd, getAuthMetadata, getMetadata } from './seo';

vi.mock('@/lib/locale/locale', () => ({
  getLocaleMessages: vi.fn(),
}));

describe('getAuthMetadata', () => {
  it('should return metadata with title and description from messages', async () => {
    const mockMessages = {
      auth: {
        login: 'Sign In',
        loginDescription: 'Please enter your credentials',
      },
    };
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      mockMessages as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'login',
      descriptionKey: 'loginDescription',
      fallbackTitle: 'Login',
      fallbackDescription: 'Login page',
    });

    expect(result).toMatchObject({
      title: 'Sign In | Cookbook',
      description: 'Please enter your credentials',
    });
  });

  it('should use fallback values if keys are missing in messages', async () => {
    const mockMessages = {
      auth: {},
    };
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      mockMessages as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'login',
      descriptionKey: 'loginDescription',
      fallbackTitle: 'Default Login',
      fallbackDescription: 'Default Description',
    });

    expect(result).toMatchObject({
      title: 'Default Login | Cookbook',
      description: 'Default Description',
    });
  });

  it('should handle missing auth object in messages', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      {} as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'createAccount',
      descriptionKey: 'signupDescription',
      fallbackTitle: 'Sign Up',
      fallbackDescription: 'Create account',
    });

    expect(result).toMatchObject({
      title: 'Sign Up | Cookbook',
      description: 'Create account',
    });
  });

  it('uses a custom title template and keywords when provided', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue({
      seo: {
        title: 'Custom Title',
        description: 'Custom Description',
        keywords: 'one, two',
      },
    } );

    const result = await getMetadata('en-gb', 'seo', {
      titleKey: 'title',
      descriptionKey: 'description',
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
      titleTemplate: '%s | My Site',
      keywordsKey: 'keywords',
      fallbackKeywords: 'fallback',
      robots: { index: true, follow: false },
      openGraph: { type: 'article' },
    });

    expect(result).toMatchObject({
      title: 'Custom Title | My Site',
      description: 'Custom Description',
      keywords: 'one, two',
      robots: { index: true, follow: false },
    });
    expect(result.openGraph).toMatchObject({
      title: 'Custom Title | My Site',
      description: 'Custom Description',
      type: 'article',
    });
  });

  it('uses fallback keywords and default openGraph type when omitted', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue({
      seo: {
        title: 'Title',
        description: 'Description',
      },
    } );

    const result = await getMetadata('en-gb', 'seo', {
      titleKey: 'title',
      descriptionKey: 'description',
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
      fallbackKeywords: 'fallback keywords',
    });

    expect(result).toMatchObject({
      title: 'Title | Cookbook',
      description: 'Description',
      keywords: 'fallback keywords',
    });
    expect(result.openGraph).toMatchObject({
      title: 'Title | Cookbook',
      description: 'Description',
      type: 'website',
    });
  });

  it('builds recipe schema markup with core recipe fields', () => {
    const recipe = {
      id: 'recipe-1',
      title: 'Tomato Pasta',
      description: 'A quick pasta recipe',
      imgSrc: 'https://example.com/pasta.jpg',
      cookingTime: 20,
      servings: 2,
      createdBy: 'user-1',
      category: { key: 'dinner', label: 'Dinner' },
      difficultyLevel: { key: 'easy', label: 'Easy' },
      labels: [{ key: 'vegetarian', label: 'Vegetarian' }],
      ingredients: [
        { localId: '1', name: 'Tomato', quantity: 2, unit: 'pcs' },
      ],
      preparationSteps: [{ order: 1, description: 'Boil pasta' }],
      prepTimeMinutes: 5,
      cookTimeMinutes: 15,
      totalTimeMinutes: 20,
      averageRating: 4.5,
      ratingsCount: 10,
    } as RecipeDetail;

    const result = buildRecipeJsonLd(recipe);

    expect(result).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Tomato Pasta',
      description: 'A quick pasta recipe',
      image: 'https://example.com/pasta.jpg',
      recipeYield: '2',
      totalTime: 'PT20M',
      prepTime: 'PT5M',
      cookTime: 'PT15M',
      recipeIngredient: ['2 pcs Tomato'],
      recipeInstructions: [
        {
          '@type': 'HowToStep',
          text: 'Boil pasta',
        },
      ],
      keywords: 'Vegetarian',
    });
  });
});
