import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adminService: { listMetadata: vi.fn() },
  metadataService: { getActiveMetadata: vi.fn() },
}));

vi.mock('@/lib/services/AdminService', () => ({
  AdminService: mocks.adminService,
}));

vi.mock('@/lib/services/MetadataService', () => ({
  MetadataService: mocks.metadataService,
}));

import { getAdminMetadata, getAllMetadata, getMetadataByType } from './index';

describe('metadata query resolvers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns only active metadata for the public list', async () => {
    mocks.metadataService.getActiveMetadata.mockResolvedValue([]);

    await getAllMetadata();

    expect(mocks.metadataService.getActiveMetadata).toHaveBeenCalledWith();
  });

  it('filters the public list by type', async () => {
    mocks.metadataService.getActiveMetadata.mockResolvedValue([]);

    await getMetadataByType(null, { type: 'LABEL' });

    expect(mocks.metadataService.getActiveMetadata).toHaveBeenCalledWith(
      'LABEL',
    );
  });

  it('lists all items for the admin view, including inactive ones', async () => {
    mocks.adminService.listMetadata.mockResolvedValue([]);

    await getAdminMetadata(
      null,
      { type: null } as never,
      {
        role: 'ADMIN',
      } as never,
    );

    expect(mocks.adminService.listMetadata).toHaveBeenCalledWith(
      'ADMIN',
      undefined,
    );
  });
});
