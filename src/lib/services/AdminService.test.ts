import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  prisma: {
    metadata: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  },
  invalidateCache: vi.fn(),
  getAvailableTranslationKeys: vi.fn(),
}));

vi.mock('@/lib/prisma/prisma', () => ({ prisma: mocks.prisma }));

vi.mock('@/lib/services/MetadataService', () => ({
  MetadataService: { invalidateActiveMetadataCache: mocks.invalidateCache },
}));

vi.mock('@/lib/metadata/translationKeys', () => ({
  getAvailableTranslationKeys: mocks.getAvailableTranslationKeys,
}));

import { AdminService } from './AdminService';

const storedItem = {
  id: 'meta-1',
  type: 'CATEGORY' as const,
  key: 'soup',
  translationKey: 'category-soup',
  sortOrder: 10,
  isActive: true,
};

const createInput = {
  type: 'CATEGORY' as const,
  key: 'brunch',
  translationKey: 'category-breakfast',
};

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAvailableTranslationKeys.mockResolvedValue([
      'category-breakfast',
      'category-soup',
    ]);
    mocks.prisma.$transaction.mockImplementation(async (operations) =>
      Promise.all(operations),
    );
    mocks.prisma.auditLog.create.mockResolvedValue({});
  });

  describe('role checks', () => {
    it('rejects callers that are not admins', async () => {
      await expect(
        AdminService.createMetadata('user-1', 'USER', createInput),
      ).rejects.toThrow('Unauthorized operation - admin rights required');
      await expect(
        AdminService.listMetadata(undefined, 'CATEGORY'),
      ).rejects.toThrow('Unauthorized operation - admin rights required');

      expect(mocks.prisma.metadata.create).not.toHaveBeenCalled();
    });
  });

  describe('createMetadata', () => {
    it('rejects keys that are not lowercase slugs', async () => {
      await expect(
        AdminService.createMetadata('admin-1', 'ADMIN', {
          ...createInput,
          key: 'Not A Slug',
        }),
      ).rejects.toThrow('Metadata key must use lowercase letters');
    });

    it('rejects translation keys outside the allowed list for the type', async () => {
      await expect(
        AdminService.createMetadata('admin-1', 'ADMIN', {
          ...createInput,
          translationKey: 'unit-g',
        }),
      ).rejects.toThrow('Translation key is not available');

      expect(mocks.getAvailableTranslationKeys).toHaveBeenCalledWith(
        'CATEGORY',
      );
    });

    it('appends the new item after the last sort order and audits the change', async () => {
      mocks.prisma.metadata.findFirst.mockResolvedValue({ sortOrder: 40 });
      mocks.prisma.metadata.create.mockResolvedValue({
        ...storedItem,
        id: 'meta-new',
        key: 'brunch',
        translationKey: 'category-breakfast',
        sortOrder: 50,
      });

      const created = await AdminService.createMetadata(
        'admin-1',
        'ADMIN',
        createInput,
      );

      expect(mocks.prisma.metadata.create).toHaveBeenCalledWith({
        data: {
          type: 'CATEGORY',
          key: 'brunch',
          translationKey: 'category-breakfast',
          sortOrder: 50,
          isActive: true,
        },
      });
      expect(mocks.invalidateCache).toHaveBeenCalled();
      expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: 'admin-1',
          action: 'METADATA_CREATED',
          targetType: 'Metadata',
          targetId: 'meta-new',
        }),
      });
      expect(created.id).toBe('meta-new');
    });

    it('starts the sort order at the step size when the type is empty', async () => {
      mocks.prisma.metadata.findFirst.mockResolvedValue(null);
      mocks.prisma.metadata.create.mockResolvedValue(storedItem);

      await AdminService.createMetadata('admin-1', 'ADMIN', createInput);

      expect(mocks.prisma.metadata.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 10 }),
      });
    });

    it('reports a duplicate key for the type as a conflict', async () => {
      mocks.prisma.metadata.findFirst.mockResolvedValue(null);
      mocks.prisma.metadata.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '7.10.0',
        }),
      );

      await expect(
        AdminService.createMetadata('admin-1', 'ADMIN', createInput),
      ).rejects.toThrow('Metadata key already exists for this type');
    });

    it('keeps the action successful when the audit write fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      mocks.prisma.metadata.findFirst.mockResolvedValue(null);
      mocks.prisma.metadata.create.mockResolvedValue(storedItem);
      mocks.prisma.auditLog.create.mockRejectedValue(new Error('db down'));

      await expect(
        AdminService.createMetadata('admin-1', 'ADMIN', createInput),
      ).resolves.toEqual(storedItem);
      expect(consoleError).toHaveBeenCalledWith(
        'Audit log write failed',
        expect.any(Error),
      );

      consoleError.mockRestore();
    });
  });

  describe('updateMetadata', () => {
    it('throws not found for unknown ids', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue(null);

      await expect(
        AdminService.updateMetadata('admin-1', 'ADMIN', 'missing', {
          translationKey: 'category-soup',
        }),
      ).rejects.toThrow('Metadata item not found');
    });

    it('rejects translation keys that do not match the stored type', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue(storedItem);

      await expect(
        AdminService.updateMetadata('admin-1', 'ADMIN', storedItem.id, {
          translationKey: 'unit-g',
        }),
      ).rejects.toThrow('Translation key is not available');
    });

    it('stores the new translation key with before and after in the audit payload', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue(storedItem);
      mocks.prisma.metadata.update.mockResolvedValue({
        ...storedItem,
        translationKey: 'category-breakfast',
      });

      await AdminService.updateMetadata('admin-1', 'ADMIN', storedItem.id, {
        translationKey: 'category-breakfast',
      });

      expect(mocks.prisma.metadata.update).toHaveBeenCalledWith({
        where: { id: storedItem.id },
        data: { translationKey: 'category-breakfast' },
      });
      expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'METADATA_UPDATED',
          payload: {
            before: expect.objectContaining({
              translationKey: 'category-soup',
            }),
            after: expect.objectContaining({
              translationKey: 'category-breakfast',
            }),
          },
        }),
      });
    });
  });

  describe('setMetadataActive', () => {
    it('soft deletes by deactivating and records the deactivation', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue(storedItem);
      mocks.prisma.metadata.update.mockResolvedValue({
        ...storedItem,
        isActive: false,
      });

      const result = await AdminService.setMetadataActive(
        'admin-1',
        'ADMIN',
        storedItem.id,
        false,
      );

      expect(mocks.prisma.metadata.update).toHaveBeenCalledWith({
        where: { id: storedItem.id },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
      expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ action: 'METADATA_DEACTIVATED' }),
      });
    });

    it('records activation with its own action name', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue({
        ...storedItem,
        isActive: false,
      });
      mocks.prisma.metadata.update.mockResolvedValue(storedItem);

      await AdminService.setMetadataActive(
        'admin-1',
        'ADMIN',
        storedItem.id,
        true,
      );

      expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ action: 'METADATA_ACTIVATED' }),
      });
    });

    it('throws not found for unknown ids', async () => {
      mocks.prisma.metadata.findUnique.mockResolvedValue(null);

      await expect(
        AdminService.setMetadataActive('admin-1', 'ADMIN', 'missing', false),
      ).rejects.toThrow('Metadata item not found');
    });
  });

  describe('reorderMetadata', () => {
    it('rejects duplicate ids', async () => {
      await expect(
        AdminService.reorderMetadata('admin-1', 'ADMIN', 'CATEGORY', [
          'a',
          'a',
        ]),
      ).rejects.toThrow('Reorder request contains duplicate ids');
    });

    it('rejects lists that do not cover every item of the type', async () => {
      mocks.prisma.metadata.findMany.mockResolvedValue([
        { id: 'a' },
        { id: 'b' },
      ]);

      await expect(
        AdminService.reorderMetadata('admin-1', 'ADMIN', 'CATEGORY', ['a']),
      ).rejects.toThrow('must list every item of the type exactly once');
      await expect(
        AdminService.reorderMetadata('admin-1', 'ADMIN', 'CATEGORY', [
          'a',
          'x',
        ]),
      ).rejects.toThrow('must list every item of the type exactly once');
    });

    it('writes sort orders in steps of ten in one transaction', async () => {
      mocks.prisma.metadata.findMany
        .mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }])
        .mockResolvedValueOnce([{ id: 'b' }, { id: 'a' }]);
      mocks.prisma.metadata.update.mockImplementation(async (args) => args);

      await AdminService.reorderMetadata('admin-1', 'ADMIN', 'CATEGORY', [
        'b',
        'a',
      ]);

      expect(mocks.prisma.metadata.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'b' },
        data: { sortOrder: 10 },
      });
      expect(mocks.prisma.metadata.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'a' },
        data: { sortOrder: 20 },
      });
      expect(mocks.prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mocks.invalidateCache).toHaveBeenCalled();
      expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'METADATA_REORDERED',
          targetId: 'CATEGORY',
          payload: { after: ['b', 'a'] },
        }),
      });
    });
  });

  describe('listMetadata', () => {
    it('filters by type when one is given', async () => {
      mocks.prisma.metadata.findMany.mockResolvedValue([storedItem]);

      const items = await AdminService.listMetadata('ADMIN', 'CATEGORY');

      expect(mocks.prisma.metadata.findMany).toHaveBeenCalledWith({
        where: { type: 'CATEGORY' },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      });
      expect(items).toEqual([storedItem]);
    });

    it('returns every type when no filter is given', async () => {
      mocks.prisma.metadata.findMany.mockResolvedValue([]);

      await AdminService.listMetadata('ADMIN');

      expect(mocks.prisma.metadata.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
    });
  });
});
