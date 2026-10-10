import type { MetadataType } from '@prisma/client';
import { cacheKeys } from '@/lib/cache/cacheKeys';
import { prisma } from '@/lib/prisma/prisma';
import { redis } from '@/lib/redis/redis';

const ACTIVE_METADATA_CACHE_TTL_SECONDS = 60 * 60;

/** `label` carries the translation key; the client resolves it per locale. */
export type PublicMetadataItem = {
  id: string;
  name: string;
  key: string;
  label: string;
  type: MetadataType;
};

export const metadataLookupKey = (type: string, key: string) =>
  `${type}:${key}`;

const loadActiveMetadata = async (): Promise<PublicMetadataItem[]> => {
  if (redis) {
    const cached = await redis.get(cacheKeys.metadataActive);
    if (cached) {
      return cached as PublicMetadataItem[];
    }
  }

  const rows = await prisma.metadata.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
  });

  const items = rows.map(
    (row): PublicMetadataItem => ({
      id: row.id,
      name: row.key,
      key: row.key,
      label: row.translationKey,
      type: row.type,
    }),
  );

  if (redis) {
    await redis.setex(
      cacheKeys.metadataActive,
      ACTIVE_METADATA_CACHE_TTL_SECONDS,
      items,
    );
  }

  return items;
};

export const MetadataService = {
  async getActiveMetadata(type?: string): Promise<PublicMetadataItem[]> {
    const items = await loadActiveMetadata();
    return type ? items.filter((item) => item.type === type) : items;
  },

  /** Includes inactive items so recipes saved with a deactivated key still snapshot correctly. */
  async getTranslationKeyLookup(): Promise<Map<string, string>> {
    const rows = await prisma.metadata.findMany({
      select: { type: true, key: true, translationKey: true },
    });

    return new Map(
      rows.map((row) => [
        metadataLookupKey(row.type, row.key),
        row.translationKey,
      ]),
    );
  },

  async invalidateActiveMetadataCache(): Promise<void> {
    if (redis) {
      await redis.del(cacheKeys.metadataActive);
    }
  },
};
