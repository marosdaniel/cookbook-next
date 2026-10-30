import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockTransaction } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {
    $transaction: mockTransaction,
  },
}));

import { UserRepository } from './repository';

const createTx = () => ({
  user: { deleteMany: vi.fn().mockResolvedValue({ count: 3 }) },
  recipe: { deleteMany: vi.fn().mockResolvedValue({ count: 5 }) },
  auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
});

const runWith =
  (tx: ReturnType<typeof createTx>) =>
  async (callback: (client: unknown) => unknown) =>
    callback(tx);

describe('UserRepository bulk deletes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransaction.mockReset();
  });

  describe('deleteAllUsersExcept', () => {
    it('deletes users and writes the audit log inside one transaction', async () => {
      const tx = createTx();
      mockTransaction.mockImplementation(runWith(tx));

      const result = await UserRepository.deleteAllUsersExcept('admin-1');

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.user.deleteMany).toHaveBeenCalledWith({
        where: { id: { not: 'admin-1' } },
      });
      expect(tx.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'admin-1',
          action: 'USERS_DELETED_ALL',
          targetType: 'User',
          targetId: 'all',
          payload: { deletedCount: 3 },
        },
      });
      expect(result).toEqual({ count: 3 });
    });

    it('propagates audit failures so the transaction can roll back', async () => {
      const tx = createTx();
      tx.auditLog.create.mockRejectedValueOnce(new Error('audit write failed'));
      mockTransaction.mockImplementation(runWith(tx));

      await expect(
        UserRepository.deleteAllUsersExcept('admin-1'),
      ).rejects.toThrow('audit write failed');
    });

    it('does not fall back to a non-transactional delete', async () => {
      mockTransaction.mockRejectedValue(new Error('transaction unavailable'));

      await expect(
        UserRepository.deleteAllUsersExcept('admin-1'),
      ).rejects.toThrow('transaction unavailable');
    });
  });

  describe('deleteAllRecipesExceptAuthor', () => {
    it('deletes recipes and writes the audit log inside one transaction', async () => {
      const tx = createTx();
      mockTransaction.mockImplementation(runWith(tx));

      const result =
        await UserRepository.deleteAllRecipesExceptAuthor('admin-1');

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(tx.recipe.deleteMany).toHaveBeenCalledWith({
        where: { createdBy: { not: 'admin-1' } },
      });
      expect(tx.auditLog.create).toHaveBeenCalledWith({
        data: {
          actorId: 'admin-1',
          action: 'RECIPES_DELETED_ALL',
          targetType: 'Recipe',
          targetId: 'all',
          payload: { deletedCount: 5 },
        },
      });
      expect(result).toEqual({ count: 5 });
    });

    it('propagates audit failures so the transaction can roll back', async () => {
      const tx = createTx();
      tx.auditLog.create.mockRejectedValueOnce(new Error('audit write failed'));
      mockTransaction.mockImplementation(runWith(tx));

      await expect(
        UserRepository.deleteAllRecipesExceptAuthor('admin-1'),
      ).rejects.toThrow('audit write failed');
    });

    it('does not fall back to a non-transactional delete', async () => {
      mockTransaction.mockRejectedValue(new Error('transaction unavailable'));

      await expect(
        UserRepository.deleteAllRecipesExceptAuthor('admin-1'),
      ).rejects.toThrow('transaction unavailable');
    });
  });
});
