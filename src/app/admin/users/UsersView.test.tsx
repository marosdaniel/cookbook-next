import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import type { UserListResult } from '@/types/adminInsights';
import { render, screen } from '@/utils/test-utils';
import UsersView from './UsersView';

const baseResult: UserListResult = {
  users: [
    {
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      role: 'ADMIN',
      recipeCount: 4,
      joinedAt: '2026-10-01T08:00:00.000Z',
    },
  ],
  total: 45,
  page: 1,
  pageCount: 3,
  pageSize: 20,
  search: '',
  role: null,
};

describe('UsersView', () => {
  it('renders the filters and a row for every user', () => {
    render(<UsersView result={baseResult} />);

    expect(screen.getByTestId('admin-users-filters')).toBeInTheDocument();
    expect(screen.getByTestId('admin-user-row-u1')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText(/@ada/)).toBeInTheDocument();
    expect(screen.getByTestId('role-badge-admin')).toBeInTheDocument();
  });

  it('disables the previous button on the first page and links to the next page', () => {
    render(<UsersView result={baseResult} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/admin/users?page=2',
    );
  });

  it('keeps the active filters in the pagination links', () => {
    render(
      <UsersView
        result={{ ...baseResult, page: 2, search: 'ada', role: 'ADMIN' }}
      />,
    );

    expect(screen.getByRole('link', { name: /previous/i })).toHaveAttribute(
      'href',
      '/admin/users?q=ada&role=ADMIN',
    );
    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/admin/users?q=ada&role=ADMIN&page=3',
    );
  });

  it('shows an empty message when no user matches', () => {
    render(
      <UsersView
        result={{ ...baseResult, users: [], total: 0, pageCount: 1 }}
      />,
    );

    expect(screen.getByTestId('admin-users-empty')).toBeInTheDocument();
  });
});
