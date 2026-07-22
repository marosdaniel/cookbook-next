import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import NewRecipePage from './page';

vi.mock('./RecipeCreateClient', () => ({
  default: () => <div data-testid="recipe-create-client" />,
}));

describe('NewRecipePage', () => {
  it('renders the create client', () => {
    render(<NewRecipePage />);

    expect(screen.getByTestId('recipe-create-client')).toBeInTheDocument();
  });
});
