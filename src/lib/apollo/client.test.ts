import { describe, expect, it } from 'vitest';

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
});
