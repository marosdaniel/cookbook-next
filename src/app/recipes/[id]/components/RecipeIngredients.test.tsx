import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { RecipeIngredients } from './RecipeIngredients';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      ingredients: 'Ingredients',
      checkedOff: 'Checked off',
      servings: 'Servings',
      decreaseServings: 'Decrease servings',
      increaseServings: 'Increase servings',
    };

    return translations[key] || key;
  },
}));

describe('RecipeIngredients', () => {
  const baseProps = {
    ingredients: [
      { localId: 'ing-1', quantity: 2, unit: 'g', name: 'Salt' },
      { localId: 'ing-2', quantity: 1, unit: 'ml', name: 'Oil' },
    ],
    servingMultiplier: 1,
    adjustedServings: 4,
    checkedIngredients: new Set<string>(),
    onToggleIngredient: vi.fn(),
    onIncrementServings: vi.fn(),
    onDecrementServings: vi.fn(),
  };

  it('renders ingredients and allows toggling and serving controls', () => {
    render(<RecipeIngredients {...baseProps} servingMultiplier={2} />);

    expect(screen.getByTestId('recipe-ingredients')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-ingredients-title')).toHaveTextContent(
      'Ingredients',
    );
    expect(screen.getByTestId('recipe-ingredients-count')).toHaveTextContent(
      'Checked off',
    );
    expect(
      screen.getByTestId('recipe-ingredients-decrease'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('recipe-ingredients-increase'),
    ).toBeInTheDocument();
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Oil')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recipe-ingredients-decrease'));
    fireEvent.click(screen.getByTestId('recipe-ingredients-increase'));

    expect(baseProps.onDecrementServings).toHaveBeenCalled();
    expect(baseProps.onIncrementServings).toHaveBeenCalled();
  });

  it('calls the toggle handler for each ingredient checkbox', () => {
    render(
      <RecipeIngredients
        {...baseProps}
        checkedIngredients={new Set(['ing-1'])}
      />,
    );

    fireEvent.click(screen.getByTestId('recipe-ingredient-checkbox-ing-1'));

    expect(baseProps.onToggleIngredient).toHaveBeenCalledWith('ing-1');
  });
});
