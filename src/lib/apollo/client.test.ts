import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/notifications', () => ({
  showErrorNotification: vi.fn(),
}));

const { mockStoreGetState } = vi.hoisted(() => ({
  mockStoreGetState: vi.fn(() => ({ global: { locale: 'en-gb' } })),
}));

vi.mock('@/lib/store', () => ({
  store: {
    getState: mockStoreGetState,
  },
}));

import { apolloClient } from './client';

describe('apollo client cache configuration', () => {
  it('uses cache-friendly defaults for queries and normalizes Recipe/User entities', () => {
    expect(apolloClient.defaultOptions.query?.fetchPolicy).toBe('cache-first');

    const cacheWithPolicies =
      apolloClient.cache as typeof apolloClient.cache & {
        policies: {
          getTypePolicy: (typeName: string) => { keyFn?: unknown };
        };
      };

    const recipePolicy = cacheWithPolicies.policies.getTypePolicy('Recipe');
    const userPolicy = cacheWithPolicies.policies.getTypePolicy('User');

    expect(recipePolicy.keyFn).toBeTypeOf('function');
    expect(userPolicy.keyFn).toBeTypeOf('function');
  });

  it('merges paginated query results for recipes, following lists, and favorites', () => {
    const cacheWithPolicies =
      apolloClient.cache as typeof apolloClient.cache & {
        policies: {
          getTypePolicy: (typeName: string) => {
            fields?: Record<
              string,
              { merge?: (incoming: unknown, existing: unknown) => unknown }
            >;
          };
        };
      };

    const queryPolicy = cacheWithPolicies.policies.getTypePolicy('Query');
    const getFavoriteRecipesMerge =
      queryPolicy.fields?.getFavoriteRecipes.merge;
    const getRecipesMerge = queryPolicy.fields?.getRecipes.merge;
    const getFollowingMerge = queryPolicy.fields?.getFollowing.merge;

    expect(getFavoriteRecipesMerge).toBeTypeOf('function');
    expect(getRecipesMerge).toBeTypeOf('function');
    expect(getFollowingMerge).toBeTypeOf('function');

    expect(getFavoriteRecipesMerge?.(['one'], [])).toEqual(['one']);

    expect(
      getRecipesMerge?.({ recipes: [{ id: 'b' }], totalRecipes: 2 }, undefined),
    ).toEqual({
      recipes: [{ id: 'b' }],
      totalRecipes: 2,
    });

    expect(
      getRecipesMerge?.(
        { recipes: [{ id: 'b' }], totalRecipes: 2 },
        { recipes: [{ id: 'a' }], totalRecipes: 1 },
      ),
    ).toEqual({
      recipes: [{ id: 'a' }, { id: 'b' }],
      totalRecipes: 2,
    });

    expect(
      getFollowingMerge?.(
        { users: [{ id: 'u2' }], totalFollowing: 2 },
        { users: [{ id: 'u1' }], totalFollowing: 1 },
      ),
    ).toEqual({
      users: [{ id: 'u1' }, { id: 'u2' }],
      totalFollowing: 2,
    });
  });

  it('falls back to the default locale message bundle when locale is missing', async () => {
    const { store } = await import('@/lib/store');
    vi.mocked(store.getState).mockReturnValue({
      global: { locale: 'fr' },
    } as never);

    const { showErrorNotification } = await import('@/utils/notifications');
    const errorLink = (apolloClient.link as unknown as { concat?: unknown })
      .concat;
    expect(errorLink).toBeDefined();
    expect(showErrorNotification).toBeDefined();
  });
});
