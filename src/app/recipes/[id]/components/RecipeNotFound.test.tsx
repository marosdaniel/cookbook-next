import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { RecipeNotFound } from './RecipeNotFound';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      notFound: 'Not found',
      notFoundDescription: 'Recipe not found',
      backToRecipes: 'Back to recipes',
    };

    return translations[key] || key;
  },
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe('RecipeNotFound', () => {
  it('renders the fallback content with the provided error message', () => {
    render(<RecipeNotFound errorMessage="Nope" />);

    expect(screen.getByTestId('recipe-not-found')).toBeInTheDocument();
    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.getByText('Nope')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to recipes' }),
    ).toHaveAttribute('href', '/recipes');
  });

  it('renders the default description when no custom message is provided', () => {
    render(<RecipeNotFound />);

    expect(screen.getByText('Recipe not found')).toBeInTheDocument();
  });
});
