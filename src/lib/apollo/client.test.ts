import { describe, expect, it } from 'vitest';

import { apolloClient } from './client';

describe('apollo client cache configuration', () => {
  it('uses cache-friendly defaults for queries and normalizes Recipe/User entities', () => {
    expect(apolloClient.defaultOptions.query?.fetchPolicy).toBe('cache-first');

    const cacheWithPolicies = apolloClient.cache as typeof apolloClient.cache & {
      policies: {
        getTypePolicy: (typeName: string) => { keyFn?: unknown };
      };
    };

    const recipePolicy = cacheWithPolicies.policies.getTypePolicy('Recipe');
    const userPolicy = cacheWithPolicies.policies.getTypePolicy('User');

    expect(recipePolicy.keyFn).toBeTypeOf('function');
    expect(userPolicy.keyFn).toBeTypeOf('function');
  });
});
