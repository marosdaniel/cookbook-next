import '@testing-library/jest-dom';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import Shell from './Shell';

const mockUseSession = vi.fn();
const mockUsePathname = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('../buttons/AuthButton', () => ({
  default: ({ variant }: { variant: string }) => (
    <div data-testid="auth-button">{variant}</div>
  ),
}));

vi.mock('../Footer', () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock('../HeaderSearch', () => ({
  HeaderSearch: () => <div data-testid="header-search" />,
}));

vi.mock('../LanguageSelector', () => ({
  default: () => <div data-testid="language-selector" />,
}));

vi.mock('../Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}));

vi.mock('../Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('../ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('Shell', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockUsePathname.mockReset();
  });

  it('renders shell chrome for a regular page', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockUsePathname.mockReturnValue('/recipes');

    render(
      <Shell>
        <div>content</div>
      </Shell>,
    );

    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(screen.getByTestId('shell-header')).toBeInTheDocument();
    expect(screen.getByTestId('shell-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('shell-footer')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('auth-button')).toBeInTheDocument();
  });

  it('hides the shell chrome on immersive create route', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockUsePathname.mockReturnValue('/recipes/create');

    render(
      <Shell>
        <div>content</div>
      </Shell>,
    );

    expect(screen.queryByTestId('shell-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-navbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-footer')).not.toBeInTheDocument();
  });

  it('hides the header search on auth pages', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockUsePathname.mockReturnValue('/login');

    render(
      <Shell>
        <div>content</div>
      </Shell>,
    );

    expect(screen.queryByTestId('header-search')).not.toBeInTheDocument();
  });

  it('shows the auth slot skeleton while the session is loading', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });
    mockUsePathname.mockReturnValue('/recipes');

    render(
      <Shell>
        <div>content</div>
      </Shell>,
    );

    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });
});
