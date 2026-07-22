import '@testing-library/jest-dom';
import type { CSSProperties, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import NotFound from './not-found';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('react-icons/gi', () => ({
  GiChefToque: ({ size, style }: { size: number; style: CSSProperties }) => (
    <svg data-testid="icon-chef-hat" width={size} height={size} style={style} />
  ),
}));

vi.mock('react-icons/fi', () => ({
  FiHome: ({ size }: { size: number }) => (
    <svg data-testid="icon-home" width={size} height={size} />
  ),
}));

describe('NotFound', () => {
  it('renders the main error structure and iconography', () => {
    render(<NotFound />);

    expect(screen.getByTestId('notfound-title')).toBeInTheDocument();
    expect(screen.getByTestId('notfound-heading')).toBeInTheDocument();
    expect(screen.getByTestId('notfound-description')).toBeInTheDocument();
    expect(screen.getByTestId('notfound-hint')).toBeInTheDocument();
    expect(screen.getByTestId('icon-chef-hat')).toBeInTheDocument();
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
  });

  it('renders the home navigation link to the public route', () => {
    render(<NotFound />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('applies the expected container and icon sizing attributes', () => {
    render(<NotFound />);

    const chefHatIcon = screen.getByTestId('icon-chef-hat');
    const homeIcon = screen.getByTestId('icon-home');

    expect(chefHatIcon).toHaveStyle({ opacity: 0.5 });
    expect(chefHatIcon).toHaveAttribute('width', '120');
    expect(chefHatIcon).toHaveAttribute('height', '120');
    expect(homeIcon).toHaveAttribute('width', '20');
    expect(homeIcon).toHaveAttribute('height', '20');
  });
});
