import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { RecipeSteps } from './RecipeSteps';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      preparationSteps: 'Preparation steps',
    };

    return translations[key] || key;
  },
}));

describe('RecipeSteps', () => {
  const steps = [
    { localId: 'step-2', order: 2, description: 'Second step' },
    { localId: 'step-1', order: 1, description: 'First step' },
  ];

  it('renders the steps sorted by order and toggles active state on click', () => {
    render(<RecipeSteps steps={steps as never[]} />);

    expect(screen.getByTestId('recipe-steps')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-steps-title')).toHaveTextContent(
      'Preparation steps',
    );
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('Second step')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recipe-step-step-1'));
    expect(screen.getByTestId('recipe-step-step-1')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByTestId('recipe-step-step-1'));
    expect(screen.getByTestId('recipe-step-step-1')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
