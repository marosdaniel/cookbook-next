import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Logo, LogoIcon } from './Logo';

// Mock useComputedColorScheme
vi.mock('@mantine/core', () => ({
  useComputedColorScheme: vi.fn(() => 'light'),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, priority, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('Logo', () => {
  it('renders the Logo component with correct alt text', () => {
    render(<Logo />);
    const image = screen.getByAltText('Cookbook Logo');
    expect(image).toBeInTheDocument();
  });

  it('renders the LogoIcon component with correct alt text', () => {
    render(<LogoIcon />);
    const image = screen.getByAltText('Cookbook');
    expect(image).toBeInTheDocument();
  });
});
