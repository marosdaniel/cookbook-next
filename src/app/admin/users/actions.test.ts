import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSessionSafely: vi.fn(),
  revalidatePath: vi.fn(),
  changeRole: vi.fn(),
  deleteUser: vi.fn(),
  loggerError: vi.fn(),
}));

vi.mock('@/lib/auth/safeSession', () => ({
  getSessionSafely: mocks.getSessionSafely,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/server/modules/admin/userManagementService', () => ({
  UserManagementService: {
    changeRole: mocks.changeRole,
    deleteUser: mocks.deleteUser,
  },
}));
vi.mock('@/server/platform/logger', () => ({
  logger: { error: mocks.loggerError },
}));

import { changeUserRoleAction, deleteUserAction } from './actions';

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };

describe('admin user actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSessionSafely.mockResolvedValue(adminSession);
    mocks.changeRole.mockResolvedValue({ ok: true });
    mocks.deleteUser.mockResolvedValue({ ok: true });
  });

  it('refuses anonymous callers and non-admins without calling the service', async () => {
    mocks.getSessionSafely.mockResolvedValueOnce(null);
    await expect(changeUserRoleAction('user-2', 'BLOGGER')).resolves.toEqual({
      ok: false,
      error: 'FORBIDDEN',
    });

    mocks.getSessionSafely.mockResolvedValueOnce({
      user: { id: 'user-9', role: 'USER' },
    });
    await expect(deleteUserAction('user-2')).resolves.toEqual({
      ok: false,
      error: 'FORBIDDEN',
    });

    expect(mocks.changeRole).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects an invalid target id', async () => {
    await expect(changeUserRoleAction('', 'BLOGGER')).resolves.toEqual({
      ok: false,
      error: 'INVALID_INPUT',
    });
    await expect(deleteUserAction('x'.repeat(65))).resolves.toEqual({
      ok: false,
      error: 'INVALID_INPUT',
    });
    expect(mocks.changeRole).not.toHaveBeenCalled();
  });

  it('changes the role as the signed in admin and refreshes the admin pages', async () => {
    await expect(changeUserRoleAction('user-2', 'BLOGGER')).resolves.toEqual({
      ok: true,
    });

    expect(mocks.changeRole).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'user-2',
      'BLOGGER',
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/users');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('deletes a user as the signed in admin and refreshes the admin pages', async () => {
    await expect(deleteUserAction('user-2')).resolves.toEqual({ ok: true });

    expect(mocks.deleteUser).toHaveBeenCalledWith(
      { id: 'admin-1', role: 'ADMIN' },
      'user-2',
    );
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(2);
  });

  it('passes domain failures through without refreshing', async () => {
    mocks.changeRole.mockResolvedValue({ ok: false, error: 'SELF_ACTION' });

    await expect(changeUserRoleAction('admin-1', 'USER')).resolves.toEqual({
      ok: false,
      error: 'SELF_ACTION',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('logs unexpected errors and returns a generic failure', async () => {
    mocks.deleteUser.mockRejectedValue(new Error('database down'));

    await expect(deleteUserAction('user-2')).resolves.toEqual({
      ok: false,
      error: 'UNKNOWN',
    });
    expect(mocks.loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'deleteUser', targetId: 'user-2' }),
      'Admin user action failed',
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
