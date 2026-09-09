import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Reveal } from './Reveal';

describe('Reveal', () => {
  it('renders children correctly', () => {
    render(
      <Reveal>
        <div data-testid="reveal-child">Content</div>
      </Reveal>,
    );

    expect(screen.getByTestId('reveal-child')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className and style', () => {
    const { container } = render(
      <Reveal className="custom-reveal" style={{ marginTop: 20 }}>
        <span>Styled</span>
      </Reveal>,
    );

    const el = container.querySelector('.custom-reveal');
    expect(el).toBeInTheDocument();
  });
});
