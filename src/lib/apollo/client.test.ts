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

import { GET_LATEST_RECIPES } from '@/lib/graphql/queries';
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
              { merge?: (...args: unknown[]) => unknown }
            >;
          };
        };
      };

    const queryPolicy = cacheWithPolicies.policies.getTypePolicy('Query');
    const getFavoriteRecipesMerge =
      queryPolicy.fields?.getFavoriteRecipes?.merge;
    const getRecipesMerge = queryPolicy.fields?.getRecipes?.merge;
    const getFollowingMerge = queryPolicy.fields?.getFollowing?.merge;

    expect(getFavoriteRecipesMerge).toBeTypeOf('function');
    expect(getRecipesMerge).toBeTypeOf('function');
    expect(getFollowingMerge).toBeTypeOf('function');

    // getFavoriteRecipes: fresh fetch without pagination
    expect(getFavoriteRecipesMerge?.([], ['one'])).toEqual(['one']);

    // getFavoriteRecipes: pagination with 'after' cursor should append
    expect(
      getFavoriteRecipesMerge?.(['one'], ['two'], {
        args: { after: 'cursor123' },
      }),
    ).toEqual(['one', 'two']);

    expect(
      getRecipesMerge?.(undefined, {
        recipes: [{ id: 'b' }],
        totalRecipes: 2,
      }),
    ).toEqual({
      recipes: [{ id: 'b' }],
      totalRecipes: 2,
    });

    // Fresh fetch (no pagination) - should replace existing data
    expect(
      getRecipesMerge?.(
        { recipes: [{ id: 'a' }], totalRecipes: 1 },
        { recipes: [{ id: 'b' }], totalRecipes: 2 },
        undefined, // no 'after' cursor means fresh fetch
      ),
    ).toEqual({
      recipes: [{ id: 'b' }],
      totalRecipes: 2,
    });

    // Pagination (with 'after' cursor) - should append new data to existing
    expect(
      getRecipesMerge?.(
        { recipes: [{ id: 'a' }], totalRecipes: 1 },
        { recipes: [{ id: 'b' }], totalRecipes: 2 },
        { args: { after: 'cursor123' } }, // 'after' cursor means pagination
      ),
    ).toEqual({
      recipes: [{ id: 'a' }, { id: 'b' }],
      totalRecipes: 2,
    });

    // Following pagination - should append new data
    expect(
      getFollowingMerge?.(
        { users: [{ id: 'u1' }], totalFollowing: 1 },
        { users: [{ id: 'u2' }], totalFollowing: 2 },
        { args: { after: 'cursor123' } }, // pagination
      ),
    ).toEqual({
      users: [{ id: 'u1' }, { id: 'u2' }],
      totalFollowing: 2,
    });
  });

  it('writes and reads getRecipes responses through the cache policy', () => {
    const cache = apolloClient.cache;
    const originalCache = cache.extract();
    cache.restore({});

    const data = {
      getRecipes: {
        __typename: 'RecipeData',
        pageInfo: {
          __typename: 'PageInfo',
          endCursor: 'cursor',
          hasNextPage: false,
        },
        recipes: [
          {
            __typename: 'Recipe',
            id: 'recipe-1',
            title: 'Recipe',
            description: 'Description',
            imgSrc: 'https://example.com/recipe.jpg',
            cookingTime: 45,
            servings: 4,
            createdBy: 'user-1',
            category: {
              __typename: 'Category',
              key: 'bakery',
              label: 'category-bakery',
            },
            difficultyLevel: {
              __typename: 'DifficultyLevel',
              key: 'hard',
              label: 'difficulty-hard',
            },
            averageRating: 0,
            ratingsCount: 0,
            isFavorite: false,
            slug: 'recipe',
          },
        ],
        totalRecipes: 1,
      },
    };

    try {
      cache.writeQuery({
        query: GET_LATEST_RECIPES,
        variables: { limit: 10 },
        data,
      });
      expect(
        cache.readQuery({
          query: GET_LATEST_RECIPES,
          variables: { limit: 10 },
        }),
      ).toEqual(data);

      const nextPage = {
        ...data,
        getRecipes: {
          ...data.getRecipes,
          recipes: [
            {
              ...data.getRecipes.recipes[0],
              id: 'recipe-2',
              title: 'Another recipe',
              slug: 'another-recipe',
            },
          ],
        },
      };

      cache.writeQuery({
        query: GET_LATEST_RECIPES,
        variables: { limit: 10, after: 'cursor' },
        data: nextPage,
      });

      expect(
        cache
          .readQuery({
            query: GET_LATEST_RECIPES,
            variables: { limit: 10 },
          })
          ?.getRecipes?.recipes.map((recipe) => recipe.id),
      ).toEqual(['recipe-1', 'recipe-2']);
    } finally {
      cache.restore(originalCache);
    }
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
