import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adminService: {
    createMetadata: vi.fn(),
    updateMetadata: vi.fn(),
    setMetadataActive: vi.fn(),
    reorderMetadata: vi.fn(),
  },
}));

vi.mock('@/lib/services/AdminService', () => ({
  AdminService: mocks.adminService,
}));

import {
  createMetadata,
  reorderMetadata,
  setMetadataActive,
  updateMetadata,
} from './index';

const adminContext = {
  userId: 'admin-1',
  role: 'ADMIN' as const,
  prisma: {} as never,
  loaders: {} as never,
};

describe('admin metadata mutation resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards the acting admin and the create input', async () => {
    const input = { type: 'DIET', key: 'paleo', translationKey: 'diet-paleo' };
    mocks.adminService.createMetadata.mockResolvedValue({ id: 'meta-1' });

    await createMetadata(
      null,
      { metadataCreateInput: input as never },
      adminContext as never,
    );

    expect(mocks.adminService.createMetadata).toHaveBeenCalledWith(
      'admin-1',
      'ADMIN',
      input,
    );
  });

  it('forwards the id and update input', async () => {
    const input = { translationKey: 'diet-keto' };

    await updateMetadata(
      null,
      { id: 'meta-1', metadataUpdateInput: input },
      adminContext as never,
    );

    expect(mocks.adminService.updateMetadata).toHaveBeenCalledWith(
      'admin-1',
      'ADMIN',
      'meta-1',
      input,
    );
  });

  it('forwards the activation flag', async () => {
    await setMetadataActive(
      null,
      { id: 'meta-1', isActive: false },
      adminContext as never,
    );

    expect(mocks.adminService.setMetadataActive).toHaveBeenCalledWith(
      'admin-1',
      'ADMIN',
      'meta-1',
      false,
    );
  });

  it('forwards the type and ordered ids', async () => {
    await reorderMetadata(
      null,
      { type: 'UNIT', orderedIds: ['b', 'a'] } as never,
      adminContext as never,
    );

    expect(mocks.adminService.reorderMetadata).toHaveBeenCalledWith(
      'admin-1',
      'ADMIN',
      'UNIT',
      ['b', 'a'],
    );
  });

  it('rejects requests without an authenticated user', async () => {
    await expect(
      setMetadataActive(null, { id: 'meta-1', isActive: true }, {
        ...adminContext,
        userId: undefined,
      } as never),
    ).rejects.toMatchObject({
      message: 'Unauthenticated operation - no user found',
    });

    expect(mocks.adminService.setMetadataActive).not.toHaveBeenCalled();
  });
});
