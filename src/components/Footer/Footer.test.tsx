import '@testing-library/jest-dom';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/utils/test-utils';
import Footer from './Footer';

const { mockUseSession } = vi.hoisted(() => ({ mockUseSession: vi.fn() }));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'cta.title': 'Ready to cook something new?',
      'cta.button': 'Share your first recipe',
      tagline: 'Discover, cook and share recipes you love.',
      explore: 'Explore',
      legal: 'Legal',
      'links.recipes': 'Browse recipes',
      'links.createRecipe': 'Create a recipe',
      'links.signup': 'Join Cookbook',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      madeWith: 'Made with love and Next.js',
    };

    if (key === 'copyright') {
      return `© ${values?.year} Cookbook. All rights reserved.`;
    }

    return translations[key] ?? key;
  },
}));

vi.mock('../Logo', () => ({
  Logo: ({ href }: { href: string }) => <a href={href}>Cookbook</a>,
}));

vi.mock('@/lib/motion/Reveal', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    nav: ({ children, ...props }: ComponentProps<'nav'>) => (
      <nav {...props}>{children}</nav>
    ),
  },
  useInView: () => true,
}));

describe('Footer', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockUseSession.mockReturnValue({ status: 'unauthenticated' });
  });

  it('renders the CTA, brand, explore, legal, and copyright content once', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByText('Ready to cook something new?'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Share your first recipe' }),
    ).toHaveAttribute('href', '/recipes/create');
    expect(
      screen.getByText('Discover, cook and share recipes you love.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
      `© ${new Date().getFullYear()} Cookbook. All rights reserved.`,
    );
  });

  it('renders each policy link and test id only once', () => {
    render(<Footer />);

    expect(screen.getByTestId('footer-privacy')).toHaveAttribute(
      'href',
      '/privacy-policy',
    );
    expect(screen.getByTestId('footer-cookie')).toHaveAttribute(
      'href',
      '/cookie-policy',
    );
    expect(screen.getAllByTestId('footer-privacy')).toHaveLength(1);
    expect(screen.getAllByTestId('footer-cookie')).toHaveLength(1);
    expect(screen.getAllByTestId('footer-copyright')).toHaveLength(1);
  });

  it('shows the signup link to signed-out visitors', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Join Cookbook' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  it('hides the signup link for authenticated visitors', () => {
    mockUseSession.mockReturnValue({ status: 'authenticated' });
    render(<Footer />);

    expect(
      screen.queryByRole('link', { name: 'Join Cookbook' }),
    ).not.toBeInTheDocument();
  });

  it('uses labelled navigation landmarks for both link groups', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(
      within(footer).getByRole('navigation', { name: 'Explore' }),
    ).toBeInTheDocument();
    expect(
      within(footer).getByRole('navigation', { name: 'Legal' }),
    ).toBeInTheDocument();
  });
});
