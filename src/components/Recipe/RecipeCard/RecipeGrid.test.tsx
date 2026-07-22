import { render, screen } from '@testing-library/react';
import type { ComponentPropsWithoutRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RecipeGrid from './RecipeGrid';

const mockRecipeCard = vi.fn();

vi.mock('@mantine/core', () => ({
  Center: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  SimpleGrid: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  Skeleton: (props: ComponentPropsWithoutRef<'div'>) => <div {...props} />,
  Stack: ({ children, ...props }: ComponentPropsWithoutRef<'div'>) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p {...props}>{children}</p>
  ),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('./RecipeCard', () => ({
  default: ({
    recipe,
    withFavorite,
  }: {
    recipe: { id: string };
    withFavorite?: boolean;
  }) => {
    mockRecipeCard(recipe, withFavorite);
    return <div data-testid={`recipe-card-${recipe.id}`} />;
  },
}));

describe('RecipeGrid', () => {
  beforeEach(() => {
    mockRecipeCard.mockReset();
  });

  it('renders loading skeletons while content is loading', () => {
    render(<RecipeGrid recipes={[]} loading />);

    expect(screen.getByTestId('recipe-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('recipe-grid-skeleton')).toHaveLength(8);
  });

  it('renders the empty state with a custom message when no recipes are present', () => {
    render(<RecipeGrid recipes={[]} emptyMessage="Nothing to see here" />);

    expect(screen.getByTestId('recipe-grid-empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing to see here')).toBeInTheDocument();
  });

  it('renders recipe cards and forwards the favorite flag', () => {
    const recipes = [
      {
        id: 'recipe-1',
        title: 'First',
        description: '',
        imgSrc: '',
        createdBy: 'u1',
      },
      {
        id: 'recipe-2',
        title: 'Second',
        description: '',
        imgSrc: '',
        createdBy: 'u2',
      },
    ];

    render(<RecipeGrid recipes={recipes as never[]} withFavorite={false} />);

    expect(screen.getByTestId('recipe-card-recipe-1')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-card-recipe-2')).toBeInTheDocument();
    expect(mockRecipeCard).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'recipe-1' }),
      false,
    );
  });
});
