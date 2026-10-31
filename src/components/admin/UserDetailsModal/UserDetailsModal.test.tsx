import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import type { InsightUserDetail } from '@/types/adminInsights';
import { render, screen } from '@/utils/test-utils';
import UserDetailsModal from './UserDetailsModal';

const user: InsightUserDetail = {
  id: 'u1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  userName: 'ada',
  email: 'ada@example.com',
  role: 'BLOGGER',
  recipeCount: 4,
  joinedAt: '2026-10-01T08:00:00.000Z',
  locale: 'hu',
  updatedAt: '2026-10-02T09:30:00.000Z',
  favoriteCount: 3,
  ratingCount: 5,
  followerCount: 7,
  followingCount: 1,
};

const renderModal = (
  overrides: Partial<Parameters<typeof UserDetailsModal>[0]> = {},
) =>
  render(
    <UserDetailsModal
      user={user}
      currentUserId="admin-1"
      busy={false}
      onClose={vi.fn()}
      onChangeRole={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  );

describe('UserDetailsModal', () => {
  it('stays closed without a user', () => {
    renderModal({ user: null });

    expect(
      screen.queryByTestId('admin-user-details-content'),
    ).not.toBeInTheDocument();
  });

  it('shows every available user field', async () => {
    renderModal();

    expect(
      await screen.findByTestId('admin-user-details-name'),
    ).toHaveTextContent('Ada Lovelace');
    expect(screen.getByTestId('admin-user-details-username')).toHaveTextContent(
      '@ada',
    );

    const expected: Record<string, string> = {
      id: 'u1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      locale: 'hu',
      recipes: '4',
      favorites: '3',
      ratings: '5',
      followers: '7',
      following: '1',
    };

    for (const [key, value] of Object.entries(expected)) {
      expect(
        screen.getByTestId(`admin-user-details-field-${key}`),
      ).toHaveTextContent(value);
    }

    expect(
      screen.getByTestId('admin-user-details-field-joined'),
    ).toHaveTextContent('2026');
    expect(
      screen.getByTestId('admin-user-details-field-updated'),
    ).toHaveTextContent('2026');
  });

  it('offers the same actions menu as the table', async () => {
    renderModal();

    expect(
      await screen.findByTestId('admin-user-details-actions-u1'),
    ).toBeInTheDocument();
  });

  it('disables the actions while an action is running', async () => {
    renderModal({ busy: true });

    expect(
      await screen.findByTestId('admin-user-details-actions-u1'),
    ).toBeDisabled();
  });
});
