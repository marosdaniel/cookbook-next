import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AuthLayout from './layout';

describe('AuthLayout', () => {
  it('renders children correctly', () => {
    render(
      <AuthLayout>
        <div data-testid="test-child">Test Content</div>
      </AuthLayout>,
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Content');
  });

  it('wraps children in a main element with correct id', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>,
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'auth-main');
  });

  it('renders multiple children', () => {
    render(
      <AuthLayout>
        <div data-testid="child-1">First</div>
        <div data-testid="child-2">Second</div>
      </AuthLayout>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('renders without children', () => {
    const { container } = render(<AuthLayout>{null}</AuthLayout>);

    const main = container.querySelector('main#auth-main');
    expect(main).toBeInTheDocument();
    expect(main).toBeEmptyDOMElement();
  });
});
