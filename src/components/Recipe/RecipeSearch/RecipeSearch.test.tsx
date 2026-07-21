import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import RecipeSearch from './RecipeSearch';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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
});
