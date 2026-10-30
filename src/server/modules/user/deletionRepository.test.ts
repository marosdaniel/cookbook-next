import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTransaction, mockRecipeFindMany, mockUserFindMany } = vi.hoisted(
  () => ({
    mockTransaction: vi.fn(),
    mockRecipeFindMany: vi.fn(),
    mockUserFindMany: vi.fn(),
  }),
);

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    $transaction: mockTransaction,
    recipe: { findMany: mockRecipeFindMany },
    user: { findMany: mockUserFindMany },
  },
}));

import {
  DELETION_INVALIDATION_LIMIT,
  DeletionRepository,
} from './deletionRepository';

describe('DeletionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();
  });

  it('collects recipe identifiers not authored by the actor, bounded', async () => {
    const rows = [{ id: 'recipe-1', slug: 'soup', createdBy: 'user-2' }];
    mockRecipeFindMany.mockResolvedValue(rows);

    await expect(
      DeletionRepository.findRecipeIdentifiersNotAuthoredBy('admin-1'),
    ).resolves.toBe(rows);
    expect(mockRecipeFindMany).toHaveBeenCalledWith({
      where: { createdBy: { not: 'admin-1' } },
      select: { id: true, slug: true, createdBy: true },
      take: DELETION_INVALIDATION_LIMIT,
    });
  });

  it('collects the ids of the users that would be deleted, bounded', async () => {
    mockUserFindMany.mockResolvedValue([{ id: 'user-2' }, { id: 'user-3' }]);

    await expect(
      DeletionRepository.findUserIdsExcept('admin-1'),
    ).resolves.toEqual(['user-2', 'user-3']);
    expect(mockUserFindMany).toHaveBeenCalledWith({
      where: { id: { not: 'admin-1' } },
      select: { id: true },
      take: DELETION_INVALIDATION_LIMIT,
    });
  });

  describe('deleteByIdWithAudit', () => {
    const params = {
      actorId: 'admin-1',
      targetId: 'user-2',
      deletedRecipeCount: 3,
    };

    const createTx = () => ({
      user: { delete: vi.fn().mockResolvedValue({ id: 'user-2' }) },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    });

    it('deletes the user and writes the audit entry in one transaction', async () => {
      const tx = createTx();
      mockTransaction.mockImplementation(
        async (callback: (client: unknown) => unknown) => callback(tx),
      );

      const result = await DeletionRepository.deleteByIdWithAudit(params);

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.user.delete).toHaveBeenCalledWith({ where: { id: 'user-2' } });
      expect(tx.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'admin-1',
          action: 'USER_DELETED',
          targetType: 'User',
          targetId: 'user-2',
          payload: { deletedRecipeCount: 3 },
        },
      });
      expect(result).toEqual({ id: 'user-2' });
    });

    it('propagates audit failures so the transaction can roll back', async () => {
      const tx = createTx();
      tx.auditLog.create.mockRejectedValueOnce(new Error('audit write failed'));
      mockTransaction.mockImplementation(
        async (callback: (client: unknown) => unknown) => callback(tx),
      );

      await expect(
        DeletionRepository.deleteByIdWithAudit(params),
      ).rejects.toThrow('audit write failed');
    });
  });
});
