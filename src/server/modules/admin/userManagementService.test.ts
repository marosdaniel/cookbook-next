import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  assertAdminRole: vi.fn(),
  invalidateCacheScope: vi.fn(),
  deleteUser: vi.fn(),
  repository: {
    findRoleById: vi.fn(),
    updateRoleWithAudit: vi.fn(),
  },
}));

vi.mock('./policy', () => ({ assertAdminRole: mocks.assertAdminRole }));
vi.mock('./userManagementRepository', () => ({
  UserManagementRepository: mocks.repository,
}));
vi.mock('@/server/modules/user', () => ({
  AccountService: { deleteUser: mocks.deleteUser },
}));
vi.mock('@/server/platform/cache', () => ({
  invalidateCacheScope: mocks.invalidateCacheScope,
}));

import { UserManagementService } from './userManagementService';

const actor = { id: 'admin-1', role: 'ADMIN' };

describe('UserManagementService.changeRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdminRole.mockReset();
    mocks.repository.findRoleById.mockResolvedValue({
      id: 'user-2',
      role: 'USER',
    });
    mocks.repository.updateRoleWithAudit.mockResolvedValue({
      id: 'user-2',
      role: 'BLOGGER',
    });
  });

  it('rejects non-admins before touching the database', async () => {
    mocks.assertAdminRole.mockImplementation(() => {
      throw new Error('forbidden');
    });

    await expect(
      UserManagementService.changeRole(
        { id: 'user-9', role: 'USER' },
        'user-2',
        'ADMIN',
      ),
    ).rejects.toThrow('forbidden');
    expect(mocks.assertAdminRole).toHaveBeenCalledWith('USER');
    expect(mocks.repository.findRoleById).not.toHaveBeenCalled();
  });

  it('rejects an unknown role and an empty target', async () => {
    await expect(
      UserManagementService.changeRole(actor, 'user-2', 'SUPERUSER'),
    ).resolves.toEqual({ ok: false, error: 'INVALID_INPUT' });
    await expect(
      UserManagementService.changeRole(actor, '', 'USER'),
    ).resolves.toEqual({ ok: false, error: 'INVALID_INPUT' });
    expect(mocks.repository.updateRoleWithAudit).not.toHaveBeenCalled();
  });

  it('does not let an admin change their own role', async () => {
    await expect(
      UserManagementService.changeRole(actor, 'admin-1', 'USER'),
    ).resolves.toEqual({ ok: false, error: 'SELF_ACTION' });
    expect(mocks.repository.findRoleById).not.toHaveBeenCalled();
    expect(mocks.repository.updateRoleWithAudit).not.toHaveBeenCalled();
  });

  it('reports a missing user', async () => {
    mocks.repository.findRoleById.mockResolvedValue(null);

    await expect(
      UserManagementService.changeRole(actor, 'user-2', 'BLOGGER'),
    ).resolves.toEqual({ ok: false, error: 'NOT_FOUND' });
    expect(mocks.repository.updateRoleWithAudit).not.toHaveBeenCalled();
  });

  it('reports an unchanged role without writing', async () => {
    await expect(
      UserManagementService.changeRole(actor, 'user-2', 'USER'),
    ).resolves.toEqual({ ok: false, error: 'UNCHANGED' });
    expect(mocks.repository.updateRoleWithAudit).not.toHaveBeenCalled();
  });

  it('changes the role with an audit entry and clears the cached session version', async () => {
    await expect(
      UserManagementService.changeRole(actor, 'user-2', 'BLOGGER'),
    ).resolves.toEqual({ ok: true });

    expect(mocks.repository.updateRoleWithAudit).toHaveBeenCalledWith({
      actorId: 'admin-1',
      targetId: 'user-2',
      fromRole: 'USER',
      toRole: 'BLOGGER',
    });
    expect(mocks.invalidateCacheScope).toHaveBeenCalledWith({
      sessionUserId: 'user-2',
    });
  });
});

describe('UserManagementService.deleteUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAdminRole.mockReset();
    mocks.repository.findRoleById.mockResolvedValue({
      id: 'user-2',
      role: 'USER',
    });
    mocks.deleteUser.mockResolvedValue(true);
  });

  it('rejects non-admins before touching the database', async () => {
    mocks.assertAdminRole.mockImplementation(() => {
      throw new Error('forbidden');
    });

    await expect(
      UserManagementService.deleteUser({ id: 'user-9', role: 'USER' }, 'user-2'),
    ).rejects.toThrow('forbidden');
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('does not let an admin delete their own account', async () => {
    await expect(
      UserManagementService.deleteUser(actor, 'admin-1'),
    ).resolves.toEqual({ ok: false, error: 'SELF_ACTION' });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects an empty target and reports a missing user', async () => {
    await expect(UserManagementService.deleteUser(actor, '')).resolves.toEqual({
      ok: false,
      error: 'INVALID_INPUT',
    });

    mocks.repository.findRoleById.mockResolvedValue(null);
    await expect(
      UserManagementService.deleteUser(actor, 'user-2'),
    ).resolves.toEqual({ ok: false, error: 'NOT_FOUND' });
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('delegates the deletion to AccountService with the admin identity', async () => {
    await expect(
      UserManagementService.deleteUser(actor, 'user-2'),
    ).resolves.toEqual({ ok: true });

    expect(mocks.deleteUser).toHaveBeenCalledWith(
      'admin-1',
      'ADMIN',
      'user-2',
    );
  });
});
