import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';

const mocks = vi.hoisted(() => ({ pathname: '/admin/metadata' }));

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('@/components/ThemeSwitcher', () => ({
  default: () => <div data-testid="theme-switcher" />,
}));

vi.mock('@/components/LanguageSelector', () => ({
  default: () => <div data-testid="language-selector" />,
}));

vi.mock('motion/react', () => ({
  motion: {
    span: ({ children, ...props }: React.ComponentProps<'span'>) => (
      <span {...props}>{children}</span>
    ),
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import AdminShell from './AdminShell';

// The global next-intl mock (vitest.setup.mts) returns the last segment of the
// translation key, e.g. `dashboard.title` renders as `title`.
describe('AdminShell', () => {
  beforeEach(() => {
    mocks.pathname = '/admin/metadata';
  });

  it('renders the redesigned admin header, navigation and children', () => {
    render(
      <AdminShell>
        <p>admin content</p>
      </AdminShell>,
    );

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-users')).toBeInTheDocument();
    expect(screen.getByTestId('admin-nav-metadata')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('marks the dashboard link active on /admin', () => {
    mocks.pathname = '/admin';
    render(
      <AdminShell>
        <p>dashboard</p>
      </AdminShell>,
    );

    expect(screen.getByTestId('admin-nav-dashboard')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('admin-nav-metadata')).not.toHaveAttribute(
      'data-active',
    );
    expect(screen.getByTestId('admin-breadcrumbs')).toHaveTextContent(
      /consoleTitle.*title/,
    );
  });
});
