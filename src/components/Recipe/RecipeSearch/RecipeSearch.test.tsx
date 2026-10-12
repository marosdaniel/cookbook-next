import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import RecipeSearch from './RecipeSearch';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    key === 'allCategories' ? 'All categories' : key,
}));

describe('RecipeSearch', () => {
  it('disables search when title is empty', () => {
    render(
      <RecipeSearch
        initialFilters={{
          title: '',
          categoryKey: null,
          difficultyLevelKey: null,
          labelKeys: [],
          maxCookingTime: '',
        }}
        onSearch={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'search' })).toBeDisabled();
  });

  it('disables search when title has fewer than 3 characters', () => {
    render(
      <RecipeSearch
        initialFilters={{
          title: 'ab',
          categoryKey: null,
          difficultyLevelKey: null,
          labelKeys: [],
          maxCookingTime: '',
        }}
        onSearch={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'search' })).toBeDisabled();
  });

  it('enables search when title has at least 3 characters', () => {
    render(
      <RecipeSearch
        initialFilters={{
          title: 'abc',
          categoryKey: null,
          difficultyLevelKey: null,
          labelKeys: [],
          maxCookingTime: '',
        }}
        onSearch={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'search' })).not.toBeDisabled();
  });

  it('updates the selected category and animates the active category pill', () => {
    render(
      <RecipeSearch
        initialFilters={{
          title: '',
          categoryKey: null,
          difficultyLevelKey: null,
          labelKeys: [],
          maxCookingTime: '',
        }}
        categoryOptions={[
          { value: 'dessert', label: 'Dessert' },
          { value: 'main', label: 'Main' },
        ]}
        onSearch={vi.fn()}
      />,
    );

    const allCategories = screen.getByRole('button', {
      name: 'All categories',
    });
    const dessert = screen.getByRole('button', { name: 'Dessert' });

    expect(allCategories).toHaveAttribute('aria-pressed', 'true');
    expect(dessert).toHaveAttribute('aria-pressed', 'false');
    expect(
      allCategories.querySelector('[layoutid="recipe-search-category-pill"]'),
    ).toBeInTheDocument();

    fireEvent.click(dessert);

    expect(allCategories).toHaveAttribute('aria-pressed', 'false');
    expect(dessert).toHaveAttribute('aria-pressed', 'true');
    expect(
      dessert.querySelector('[layoutid="recipe-search-category-pill"]'),
    ).toBeInTheDocument();
  });
});
