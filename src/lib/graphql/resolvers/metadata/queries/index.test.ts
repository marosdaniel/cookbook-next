import { describe, expect, it } from 'vitest';
import { getAllMetadata, getMetadataByKey, getMetadataByType } from './index';

describe('metadata query resolvers', () => {
  it('returns all metadata entries from the shared metadata catalog', async () => {
    const result = await getAllMetadata({}, {}, {} as never);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual(expect.objectContaining({ key: expect.any(String) }));
  });

  it('returns a specific metadata entry by key', async () => {
    const result = await getMetadataByKey({}, { key: 'category-dessert' }, {} as never);

    expect(result).toEqual(
      expect.objectContaining({
        key: 'category-dessert',
        type: 'CATEGORY',
      }),
    );
  });

  it('returns metadata entries filtered by type ignoring casing', async () => {
    const result = await getMetadataByType({}, { type: 'label' }, {} as never);

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((entry) => entry.type.toLowerCase() === 'label')).toBe(true);
  });
});
