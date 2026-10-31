import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserListResult } from '@/types/adminInsights';
import { fireEvent, render, screen, waitFor } from '@/utils/test-utils';

const mocks = vi.hoisted(() => ({
  changeUserRoleAction: vi.fn(),
  deleteUserAction: vi.fn(),
  showSuccessNotification: vi.fn(),
  showErrorNotification: vi.fn(),
}));

vi.mock('../actions', () => ({
  changeUserRoleAction: mocks.changeUserRoleAction,
  deleteUserAction: mocks.deleteUserAction,
}));
vi.mock('@/utils/notifications', () => ({
  showSuccessNotification: mocks.showSuccessNotification,
  showErrorNotification: mocks.showErrorNotification,
}));

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
      locale: 'hu',
      updatedAt: '2026-10-02T09:30:00.000Z',
      favoriteCount: 3,
      ratingCount: 5,
      followerCount: 7,
      followingCount: 1,
    },
  ],
  total: 45,
  page: 1,
  pageCount: 3,
  pageSize: 20,
  search: '',
  role: null,
};

const CURRENT_ADMIN_ID = 'admin-1';

describe('UsersView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.changeUserRoleAction.mockResolvedValue({ ok: true });
    mocks.deleteUserAction.mockResolvedValue({ ok: true });
  });

  it('renders the filters, a row for every user and the actions column', () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    expect(screen.getByTestId('admin-users-filters')).toBeInTheDocument();
    expect(screen.getByTestId('admin-users-column-actions')).toBeInTheDocument();
    expect(screen.getByTestId('admin-user-row-u1')).toBeInTheDocument();
    expect(screen.getByTestId('admin-user-actions-u1')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText(/@ada/)).toBeInTheDocument();
    expect(screen.getByTestId('role-badge-admin')).toBeInTheDocument();
  });

  it('disables the previous button on the first page and links to the next page', () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

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
        currentUserId={CURRENT_ADMIN_ID}
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
        currentUserId={CURRENT_ADMIN_ID}
      />,
    );

    expect(screen.getByTestId('admin-users-empty')).toBeInTheDocument();
  });

  it('opens the details modal with every user field when a row is clicked', async () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    fireEvent.click(screen.getByTestId('admin-user-row-u1'));

    expect(
      await screen.findByTestId('admin-user-details-modal'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('admin-user-details-field-locale')).toHaveTextContent(
      'hu',
    );
    expect(
      screen.getByTestId('admin-user-details-field-followers'),
    ).toHaveTextContent('7');
    expect(
      screen.getByTestId('admin-user-details-actions-u1'),
    ).toBeInTheDocument();
  });

  it('opens the details modal from the name button for keyboard users', async () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    fireEvent.click(screen.getByTestId('admin-user-open-u1'));

    expect(
      await screen.findByTestId('admin-user-details-modal'),
    ).toBeInTheDocument();
  });

  it('does not open the details modal when the actions menu is used', async () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));

    expect(
      await screen.findByTestId('admin-user-actions-delete-u1'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('admin-user-details-modal'),
    ).not.toBeInTheDocument();
  });

  it('deletes a user after the confirmation', async () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));
    fireEvent.click(await screen.findByTestId('admin-user-actions-delete-u1'));

    expect(mocks.deleteUserAction).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByTestId('admin-delete-user-confirm'));

    await waitFor(() =>
      expect(mocks.deleteUserAction).toHaveBeenCalledWith('u1'),
    );
    await waitFor(() =>
      expect(mocks.showSuccessNotification).toHaveBeenCalledTimes(1),
    );
  });

  it('does not delete anything when the confirmation is cancelled', async () => {
    render(<UsersView result={baseResult} currentUserId={CURRENT_ADMIN_ID} />);

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));
    fireEvent.click(await screen.findByTestId('admin-user-actions-delete-u1'));
    fireEvent.click(await screen.findByTestId('admin-delete-user-cancel'));

    expect(mocks.deleteUserAction).not.toHaveBeenCalled();
  });

  it('disables the actions on the own account', async () => {
    render(<UsersView result={baseResult} currentUserId="u1" />);

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));

    expect(
      await screen.findByTestId('admin-user-actions-delete-u1'),
    ).toHaveAttribute('data-disabled', 'true');
  });
});
