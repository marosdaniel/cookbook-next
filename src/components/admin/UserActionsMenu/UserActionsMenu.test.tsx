import '@testing-library/jest-dom';
import { Menu } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';
import type { InsightUserDetail } from '@/types/adminInsights';
import { fireEvent, render, screen } from '@/utils/test-utils';
import UserActionsMenu, { RoleMenuItems } from './UserActionsMenu';

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

const noop = () => undefined;

describe('UserActionsMenu', () => {
  it('renders the compact action icon for table rows', () => {
    render(
      <UserActionsMenu
        user={user}
        currentUserId="admin-1"
        onChangeRole={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByTestId('admin-user-actions-u1')).toBeInTheDocument();
  });

  it('renders a labelled button in the button variant with its own identifiers', () => {
    render(
      <UserActionsMenu
        user={user}
        currentUserId="admin-1"
        variant="button"
        onChangeRole={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByTestId('admin-user-details-actions-u1')).toHaveTextContent(
      'button',
    );
    expect(screen.queryByTestId('admin-user-actions-u1')).not.toBeInTheDocument();
  });

  it('opens the menu and reports the user to delete', async () => {
    const onDelete = vi.fn();
    render(
      <UserActionsMenu
        user={user}
        currentUserId="admin-1"
        onChangeRole={noop}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));

    expect(
      await screen.findByTestId('admin-user-actions-promote-u1'),
    ).toBeInTheDocument();
    fireEvent.click(await screen.findByTestId('admin-user-actions-delete-u1'));

    expect(onDelete).toHaveBeenCalledWith(user);
  });

  it('disables promote and delete for the signed in admin', async () => {
    render(
      <UserActionsMenu
        user={user}
        currentUserId="u1"
        onChangeRole={noop}
        onDelete={noop}
      />,
    );

    fireEvent.click(screen.getByTestId('admin-user-actions-u1'));

    expect(
      await screen.findByTestId('admin-user-actions-delete-u1'),
    ).toHaveAttribute('data-disabled', 'true');
    expect(
      await screen.findByTestId('admin-user-actions-promote-u1'),
    ).toHaveAttribute('data-disabled', 'true');
  });

  it('disables the trigger while an action is running', () => {
    render(
      <UserActionsMenu
        user={user}
        currentUserId="admin-1"
        disabled
        onChangeRole={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByTestId('admin-user-actions-u1')).toBeDisabled();
  });
});

describe('RoleMenuItems', () => {
  const renderItems = (onChangeRole: () => void) =>
    render(
      <Menu opened withinPortal={false}>
        <Menu.Target>
          <button type="button">open</button>
        </Menu.Target>
        <Menu.Dropdown>
          <RoleMenuItems
            user={user}
            testIdPrefix="admin-user"
            onChangeRole={onChangeRole}
          />
        </Menu.Dropdown>
      </Menu>,
    );

  it('marks the current role as disabled and offers the other roles', async () => {
    renderItems(vi.fn());

    expect(
      await screen.findByTestId('admin-user-role-option-user-u1'),
    ).toHaveAttribute('data-disabled', 'true');
    expect(
      await screen.findByTestId('admin-user-role-option-blogger-u1'),
    ).not.toHaveAttribute('data-disabled');
    expect(
      await screen.findByTestId('admin-user-role-option-admin-u1'),
    ).not.toHaveAttribute('data-disabled');
  });

  it('reports the selected role', async () => {
    const onChangeRole = vi.fn();
    renderItems(onChangeRole);

    fireEvent.click(
      await screen.findByTestId('admin-user-role-option-blogger-u1'),
    );

    expect(onChangeRole).toHaveBeenCalledWith(user, 'BLOGGER');
  });
});
