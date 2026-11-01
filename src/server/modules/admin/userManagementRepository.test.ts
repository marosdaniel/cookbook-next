import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindUnique, mockTransaction } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    user: { findUnique: mockFindUnique },
    $transaction: mockTransaction,
  },
}));

import { UserManagementRepository } from './userManagementRepository';

const createTx = () => ({
  user: {
    update: vi.fn().mockResolvedValue({ id: 'target-1', role: 'ADMIN' }),
  },
  auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
});

describe('UserManagementRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();
  });

  describe('findRoleById', () => {
    it('selects only the id and role of the user', async () => {
      mockFindUnique.mockResolvedValue({ id: 'target-1', role: 'USER' });

      const result = await UserManagementRepository.findRoleById('target-1');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'target-1' },
        select: { id: true, role: true },
      });
      expect(result).toEqual({ id: 'target-1', role: 'USER' });
    });

    it('returns null when the user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        UserManagementRepository.findRoleById('missing'),
      ).resolves.toBeNull();
    });
  });

  describe('updateRoleWithAudit', () => {
    it('updates the role, bumps sessionVersion and writes the audit entry in one transaction', async () => {
      const tx = createTx();
      mockTransaction.mockImplementation(
        async (callback: (client: unknown) => unknown) => callback(tx),
      );

      const result = await UserManagementRepository.updateRoleWithAudit({
        actorId: 'admin-1',
        targetId: 'target-1',
        fromRole: 'USER',
        toRole: 'ADMIN',
      } as Parameters<typeof UserManagementRepository.updateRoleWithAudit>[0]);

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 'target-1' },
        data: {
          role: 'ADMIN',
          sessionVersion: { increment: 1 },
        },
        select: { id: true, role: true },
      });
      expect(tx.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'admin-1',
          action: 'USER_ROLE_CHANGED',
          targetType: 'User',
          targetId: 'target-1',
          payload: { from: 'USER', to: 'ADMIN' },
        },
      });
      expect(result).toEqual({ id: 'target-1', role: 'ADMIN' });
    });

    it('propagates audit failures so the role change can be rolled back', async () => {
      const tx = createTx();
      tx.auditLog.create.mockRejectedValueOnce(new Error('audit write failed'));
      mockTransaction.mockImplementation(
        async (callback: (client: unknown) => unknown) => callback(tx),
      );

      await expect(
        UserManagementRepository.updateRoleWithAudit({
          actorId: 'admin-1',
          targetId: 'target-1',
          fromRole: 'USER',
          toRole: 'ADMIN',
        } as Parameters<
          typeof UserManagementRepository.updateRoleWithAudit
        >[0]),
      ).rejects.toThrow('audit write failed');
    });
  });
});
