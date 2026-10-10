import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cacheKeys } from '@/lib/cache/cacheKeys';

const mocks = vi.hoisted(() => ({
  prisma: {
    metadata: { findMany: vi.fn() },
  },
  redis: null as null | {
    get: ReturnType<typeof vi.fn>;
    setex: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
  },
}));

vi.mock('@/lib/prisma/prisma', () => ({ prisma: mocks.prisma }));

vi.mock('@/lib/redis/redis', () => ({
  get redis() {
    return mocks.redis;
  },
}));

import { MetadataService } from './MetadataService';

const dbRows = [
  {
    id: 'meta-1',
    type: 'CATEGORY',
    key: 'soup',
    translationKey: 'category-soup',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'meta-2',
    type: 'LABEL',
    key: 'vegan',
    translationKey: 'label-vegan',
    sortOrder: 10,
    isActive: true,
  },
];

const publicItems = [
  {
    id: 'meta-1',
    name: 'soup',
    key: 'soup',
    label: 'category-soup',
    type: 'CATEGORY',
  },
  {
    id: 'meta-2',
    name: 'vegan',
    key: 'vegan',
    label: 'label-vegan',
    type: 'LABEL',
  },
];

const createRedisMock = () => ({
  get: vi.fn().mockResolvedValue(null),
  setex: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
});

describe('MetadataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redis = createRedisMock();
  });

  describe('getActiveMetadata', () => {
    it('returns cached items without querying the database', async () => {
      mocks.redis?.get.mockResolvedValue(publicItems);

      const items = await MetadataService.getActiveMetadata();

      expect(items).toEqual(publicItems);
      expect(mocks.redis?.get).toHaveBeenCalledWith(cacheKeys.metadataActive);
      expect(mocks.prisma.metadata.findMany).not.toHaveBeenCalled();
    });

    it('loads active rows on a cache miss and caches them for an hour', async () => {
      mocks.prisma.metadata.findMany.mockResolvedValue(dbRows);

      const items = await MetadataService.getActiveMetadata();

      expect(mocks.prisma.metadata.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      });
      expect(items).toEqual(publicItems);
      expect(mocks.redis?.setex).toHaveBeenCalledWith(
        cacheKeys.metadataActive,
        60 * 60,
        publicItems,
      );
    });

    it('filters the list by type', async () => {
      mocks.redis?.get.mockResolvedValue(publicItems);

      const items = await MetadataService.getActiveMetadata('LABEL');

      expect(items).toEqual([publicItems[1]]);
    });

    it('works without a configured cache', async () => {
      mocks.redis = null;
      mocks.prisma.metadata.findMany.mockResolvedValue(dbRows);

      await expect(MetadataService.getActiveMetadata()).resolves.toEqual(
        publicItems,
      );
    });
  });

  describe('getTranslationKeyLookup', () => {
    it('maps every stored item, including inactive ones, to its translation key', async () => {
      mocks.prisma.metadata.findMany.mockResolvedValue([
        ...dbRows,
        {
          id: 'meta-3',
          type: 'DIET',
          key: 'paleo',
          translationKey: 'diet-paleo',
          sortOrder: 10,
          isActive: false,
        },
      ]);

      const lookup = await MetadataService.getTranslationKeyLookup();

      expect(mocks.prisma.metadata.findMany).toHaveBeenCalledWith({
        select: { type: true, key: true, translationKey: true },
      });
      expect(lookup.get('CATEGORY:soup')).toBe('category-soup');
      expect(lookup.get('DIET:paleo')).toBe('diet-paleo');
    });
  });

  describe('invalidateActiveMetadataCache', () => {
    it('deletes the cached public list', async () => {
      await MetadataService.invalidateActiveMetadataCache();

      expect(mocks.redis?.del).toHaveBeenCalledWith(cacheKeys.metadataActive);
    });

    it('does nothing without a configured cache', async () => {
      mocks.redis = null;

      await expect(
        MetadataService.invalidateActiveMetadataCache(),
      ).resolves.toBeUndefined();
    });
  });
});
