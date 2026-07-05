import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RecipeCard from './RecipeCard';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/buttons/FavoriteButton', () => ({
  FavoriteButton: () => <div data-testid="favorite-button" />,
}));

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
});
