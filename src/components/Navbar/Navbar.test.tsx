import '@testing-library/jest-dom';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/utils/test-utils';
import Navbar from './Navbar';

const mockUseSession = vi.fn();
const mockUsePathname = vi.fn();
const mockSignOut = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      profile: 'Profile',
      myRecipes: 'My recipes',
      favorites: 'Favorites',
      followings: 'Followings',
      recipes: 'Recipes',
      allRecipes: 'All recipes',
      newRecipe: 'New recipe',
      logout: 'Logout',
      sidebarAdmin: 'Admin console',
    })[key] || key,
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});

vi.mock('@/lib/apollo/client', () => ({
  apolloClient: { clearStore: vi.fn() },
}));

vi.mock('../buttons/NavButton', () => ({
  default: ({ label, href }: { label: string; href: string }) => (
    <a href={href} data-testid="nav-button">
      {label}
    </a>
  ),
}));

vi.mock('../buttons/UserButton', () => ({
  default: () => <div data-testid="user-button">User button</div>,
}));

vi.mock('./NavbarLinksGroup/NavbarLinksGroup', () => ({
  default: ({ label, link }: { label: string; link?: string }) => (
    <div data-testid={`navbar-group-${typeof label === 'string' ? label : 'user'}`}>
      {label}
      {link ? `:${link}` : ''}
    </div>
  ),
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockUseSession.mockReset();
    mockUsePathname.mockReset();
    mockSignOut.mockReset();
    mockUsePathname.mockReturnValue('/recipes');
  });

  it('renders anonymous state and login CTA by default', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<Navbar />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-links')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-footer')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.queryByText('Admin console')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders loading footer state while the session is resolving', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' });

    render(<Navbar />);

    expect(screen.getByTestId('navbar-footer')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders the authenticated footer and user section when a session exists', () => {
    mockUseSession.mockReturnValue({
      data: { user: { userName: 'Jane Doe', email: 'jane@example.com', role: 'USER' } },
      status: 'authenticated',
    });

    render(<Navbar />);

    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Admin console')).not.toBeInTheDocument();
  });

  it('renders the admin entry first and links to the dashboard only for admins', () => {
    mockUseSession.mockReturnValue({
      data: { user: { userName: 'Jane Admin', email: 'admin@example.com', role: 'ADMIN' } },
      status: 'authenticated',
    });

    render(<Navbar />);

    const groups = screen.getAllByTestId(/^navbar-group-/);
    expect(groups[0]).toHaveTextContent('Admin console');
    expect(groups[0]).toHaveTextContent('/admin');
    expect(screen.getByTestId('navbar-group-Admin console')).toBeInTheDocument();
  });

  it('uses a public redirect callback when logging out from a non-protected route', () => {
    mockUseSession.mockReturnValue({
      data: { user: { userName: 'Jane Doe', email: 'jane@example.com', role: 'USER' } },
      status: 'authenticated',
    });
    mockUsePathname.mockReturnValue('/recipes');

    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/recipes' });
  });

  it('uses the login route callback when logging out from a protected route', () => {
    mockUseSession.mockReturnValue({
      data: { user: { userName: 'Jane Doe', email: 'jane@example.com', role: 'USER' } },
      status: 'authenticated',
    });
    mockUsePathname.mockReturnValue('/recipes/create');

    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' });
  });
});
