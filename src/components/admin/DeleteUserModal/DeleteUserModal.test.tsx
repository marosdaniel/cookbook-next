import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import type { InsightUserDetail } from '@/types/adminInsights';
import { fireEvent, render, screen } from '@/utils/test-utils';
import DeleteUserModal from './DeleteUserModal';

const user: InsightUserDetail = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  userName: 'ada',
  email: 'ada@example.com',
  role: 'USER',
  recipeCount: 4,
  joinedAt: '2026-10-01T08:00:00.000Z',
  locale: 'hu',
  updatedAt: '2026-10-02T09:30:00.000Z',
  favoriteCount: 3,
  ratingCount: 5,
  followerCount: 7,
  followingCount: 1,
};

describe('DeleteUserModal', () => {
  it('stays closed without a user', () => {
    render(
      <DeleteUserModal
        user={null}
        loading={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.queryByTestId('admin-delete-user-confirm'),
    ).not.toBeInTheDocument();
  });

  it('asks for confirmation and reports the user to delete', async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteUserModal
        user={user}
        loading={false}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(await screen.findByTestId('admin-delete-user-confirm'));

    expect(onConfirm).toHaveBeenCalledWith(user);
  });

  it('cancels without deleting', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <DeleteUserModal
        user={user}
        loading={false}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(await screen.findByTestId('admin-delete-user-cancel'));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables cancelling while the deletion is running', async () => {
    render(
      <DeleteUserModal
        user={user}
        loading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      await screen.findByTestId('admin-delete-user-cancel'),
    ).toBeDisabled();
  });
});
