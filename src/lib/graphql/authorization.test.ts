import { describe, expect, it } from 'vitest';
import { assertGraphQLOperationAuthorized } from './authorization';

describe('assertGraphQLOperationAuthorized', () => {
  it('rejects unnamed operations before policy lookup', () => {
    expect(() => assertGraphQLOperationAuthorized(undefined)).toThrow(
      'GraphQL operations must provide an operation name.',
    );
    expect(() => assertGraphQLOperationAuthorized(null)).toThrow(
      'GraphQL operations must provide an operation name.',
    );
  });

  it('allows configured public operations without a role', () => {
    expect(() => assertGraphQLOperationAuthorized('getRecipes')).not.toThrow();
  });

  it('allows configured user operations for authenticated users', () => {
    expect(() =>
      assertGraphQLOperationAuthorized('createRecipe', 'USER'),
    ).not.toThrow();
  });

  it('rejects protected operations for anonymous callers', () => {
    expect(() => assertGraphQLOperationAuthorized('createRecipe')).toThrow(
      "Unauthorized: you don't have permission to perform 'createRecipe'",
    );
  });

  it('rejects operations absent from the allowlist', () => {
    expect(() =>
      assertGraphQLOperationAuthorized('futureUnconfiguredOperation', 'USER'),
    ).toThrow(
      "Unauthorized: you don't have permission to perform 'futureUnconfiguredOperation'",
    );
  });
});
