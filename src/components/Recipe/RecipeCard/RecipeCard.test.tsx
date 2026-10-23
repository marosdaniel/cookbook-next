import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RecipeCard from './RecipeCard';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    ViewTransition: ({
      name,
      children,
    }: {
      name?: string;
      children: React.ReactNode;
    }) => <div data-view-transition={name}>{children}</div>,
  };
});

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/buttons/FavoriteButton', () => ({
  FavoriteButton: () => <div data-testid="favorite-button" />,
}));

const baseRecipe = {
  id: 'recipe-123',
  title: 'Test recipe',
  description: 'A test recipe',
  imgSrc: '',
  cookingTime: 20,
  servings: 2,
  createdBy: 'user-1',
  category: { key: 'dessert', label: 'Dessert' },
  difficultyLevel: { key: 'easy', label: 'Easy' },
  averageRating: 4.5,
  ratingsCount: 10,
  isFavorite: false,
};

describe('RecipeCard', () => {
  it('renders a detail link with the resolved recipe id', () => {
    render(
      <MantineProvider>
        <RecipeCard
          recipe={{
            id: 'recipe-123',
            title: 'Test recipe',
            description: 'A test recipe',
            imgSrc: '',
            cookingTime: 20,
            servings: 2,
            createdBy: 'user-1',
            category: { key: 'dessert', label: 'Dessert' },
            difficultyLevel: { key: 'easy', label: 'Easy' },
            averageRating: 4.5,
            ratingsCount: 10,
            isFavorite: false,
          }}
        />
      </MantineProvider>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/recipes/recipe-123',
    );
  });

  it('registers unique view transition names by default', () => {
    const { container } = render(
      <MantineProvider>
        <RecipeCard recipe={baseRecipe} />
      </MantineProvider>,
    );

    expect(
      container.querySelector(
        '[data-view-transition="recipe-recipe-123-image"]',
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-view-transition="recipe-recipe-123-title"]',
      ),
    ).toBeInTheDocument();
  });

  it('skips view transitions when withTransitions is false', () => {
    const { container } = render(
      <MantineProvider>
        <RecipeCard recipe={baseRecipe} withTransitions={false} />
      </MantineProvider>,
    );

    expect(container.querySelector('[data-view-transition]')).toBeNull();
  });

  it('shows the cursor glow only for mouse pointer interactions', () => {
    render(
      <MantineProvider>
        <RecipeCard
          recipe={{
            id: 'recipe-123',
            title: 'Test recipe',
            description: 'A test recipe',
            imgSrc: '',
            cookingTime: 20,
            servings: 2,
            createdBy: 'user-1',
            category: { key: 'dessert', label: 'Dessert' },
            difficultyLevel: { key: 'easy', label: 'Easy' },
            averageRating: 4.5,
            ratingsCount: 10,
            isFavorite: false,
          }}
        />
      </MantineProvider>,
    );

    const card = screen.getByTestId('recipe-card');
    const glow = screen.getByTestId('recipe-card-glow');

    fireEvent.pointerEnter(card, { pointerType: 'touch' });
    expect(glow.className).not.toContain('cardGlowVisible');

    fireEvent.pointerEnter(card, { pointerType: 'mouse' });
    expect(glow.className).toContain('cardGlowVisible');
  });
});
