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

import AdminShell from './AdminShell';

describe('AdminShell', () => {
  beforeEach(() => {
    mocks.pathname = '/admin/metadata';
  });

  it('renders the page content inside the admin layout', () => {
    render(
      <AdminShell>
        <p>metadata page</p>
      </AdminShell>,
    );

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument();
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    expect(screen.getByText('metadata page')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument();
  });

  it('marks the metadata link active on its section and shows it in the breadcrumbs', () => {
    render(
      <AdminShell>
        <p>content</p>
      </AdminShell>,
    );

    expect(screen.getByTestId('admin-nav-metadata')).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(screen.getByTestId('admin-breadcrumbs')).toHaveTextContent(
      'navMetadata',
    );
  });

  it('does not mark the metadata link active elsewhere in the admin area', () => {
    mocks.pathname = '/admin';

    render(
      <AdminShell>
        <p>content</p>
      </AdminShell>,
    );

    expect(screen.getByTestId('admin-nav-metadata')).not.toHaveAttribute(
      'data-active',
    );
  });
});
