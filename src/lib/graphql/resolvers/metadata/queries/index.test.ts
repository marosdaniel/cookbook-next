import { describe, expect, it } from 'vitest';
import type { prisma } from '@/lib/prisma/prisma';
import type { GraphQLContext } from '@/types/graphql/context';
import { getAllMetadata, getMetadataByKey, getMetadataByType } from './index';

const createGraphQLContext = (): GraphQLContext => ({
  prisma: {} as typeof prisma,
  loaders: {
    ratings: {} as never,
    isFavorite: null,
    userRating: null,
    recipeAuthor: {} as never,
    userRecipes: {} as never,
    userFavoriteRecipes: {} as never,
  },
});

describe('metadata query resolvers', () => {
  it('returns all metadata entries from the shared metadata catalog', async () => {
    const result = await getAllMetadata({}, {}, createGraphQLContext());

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toEqual(
      expect.objectContaining({ key: expect.any(String) }),
    );
  });

  it('returns a specific metadata entry by key', async () => {
    const result = await getMetadataByKey(
      {},
      { key: 'category-dessert' },
      createGraphQLContext(),
    );

    expect(result).toEqual(
      expect.objectContaining({
        key: 'category-dessert',
        type: 'CATEGORY',
      }),
    );
  });

  it('returns metadata entries filtered by type ignoring casing', async () => {
    const result = await getMetadataByType(
      {},
      { type: 'label' },
      createGraphQLContext(),
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((entry) => entry.type.toLowerCase() === 'label')).toBe(
      true,
    );
  });
});
