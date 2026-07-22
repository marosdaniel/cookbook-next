import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { RecipeHero } from './RecipeHero';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      editRecipe: 'Edit recipe',
      cookingTime: `Cook ${values?.time as string}`,
      servingsCount: `Serves ${values?.count as string}`,
      notFound: 'Not found',
      notFoundDescription: 'Recipe not found',
      backToRecipes: 'Back to recipes',
      ingredients: 'Ingredients',
      checkedOff: 'Checked off',
      servings: 'Servings',
      preparationSteps: 'Preparation steps',
      videoTitle: 'Video',
      'category-main': 'Main',
      'level-easy': 'Easy',
      'label-healthy': 'Healthy',
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

vi.mock('@/components/buttons/FavoriteButton', () => ({
  FavoriteButton: () => <button type="button">favorite</button>,
}));

describe('RecipeHero', () => {
  const recipe = {
    id: 'recipe-1',
    title: 'Pasta Primavera',
    description: 'A fresh pasta dish',
    imgSrc: '/hero.jpg',
    category: { key: 'main' },
    difficultyLevel: { key: 'easy' },
    labels: [{ key: 'healthy' }],
    cookingTime: 20,
    servings: 4,
    ratingsCount: 3,
    averageRating: 4.5,
    isFavorite: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero content, image, and owner action when available', () => {
    render(<RecipeHero recipe={recipe as never} isOwner />);

    expect(screen.getByTestId('recipe-hero')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-hero-title')).toHaveTextContent(
      'Pasta Primavera',
    );
    expect(screen.getByTestId('recipe-hero-description')).toHaveTextContent(
      'A fresh pasta dish',
    );
    expect(screen.getByTestId('recipe-hero-image')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-hero-edit-action')).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
    expect(screen.getByText('Cook 20')).toBeInTheDocument();
    expect(screen.getByText('Serves 4')).toBeInTheDocument();
    expect(screen.getByText('4.5 (3)')).toBeInTheDocument();
  });

  it('renders the placeholder state and hides the edit action when the user is not the owner', () => {
    render(
      <RecipeHero
        recipe={{ ...recipe, imgSrc: undefined } as never}
        isOwner={false}
      />,
    );

    expect(screen.getByTestId('recipe-hero-placeholder')).toBeInTheDocument();
    expect(
      screen.queryByTestId('recipe-hero-edit-action'),
    ).not.toBeInTheDocument();
  });
});
