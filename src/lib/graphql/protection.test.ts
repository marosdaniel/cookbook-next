import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GRAPHQL_MAX_LIMIT,
  getPersistedQueryHash,
  resolveQueryLimit,
  validatePersistedQuery,
} from './protection';

describe('resolveQueryLimit', () => {
  it('returns the original limit when it is within the allowed range', () => {
    expect(resolveQueryLimit(25)).toBe(25);
  });

  it('caps oversized limits to the configured maximum', () => {
    expect(resolveQueryLimit(10000)).toBe(DEFAULT_GRAPHQL_MAX_LIMIT);
  });

  it('returns undefined for empty values', () => {
    expect(resolveQueryLimit()).toBeUndefined();
    expect(resolveQueryLimit(null as unknown as number)).toBeUndefined();
  });

  it('returns undefined for non-finite values and clamps too-small values', () => {
    expect(resolveQueryLimit(Number.NaN)).toBeUndefined();
    expect(resolveQueryLimit(0)).toBe(1);
    expect(resolveQueryLimit(-5)).toBe(1);
  });
});

describe('validatePersistedQuery', () => {
  it('accepts a matching persisted query hash', () => {
    const query = 'query GetRecipes { getRecipes(limit: 10) { id } }';
    const hash = getPersistedQueryHash(query);

    expect(validatePersistedQuery(query, hash)).toBe(true);
  });

  it('rejects a mismatched persisted query hash', () => {
    const query = 'query GetRecipes { getRecipes(limit: 10) { id } }';

    expect(validatePersistedQuery(query, 'invalid-hash')).toBe(false);
  });

  it('rejects when no persisted hash is provided', () => {
    const query = 'query GetRecipes { getRecipes(limit: 10) { id } }';

    expect(validatePersistedQuery(query)).toBe(false);
  });

  it('treats queries with and without __typename as the same persisted query', () => {
    const queryWithoutTypename =
      'query GetRecipes { getRecipes(limit: 10) { id } }';
    const queryWithTypename =
      'query GetRecipes { getRecipes(limit: 10) { id __typename } }';

    expect(getPersistedQueryHash(queryWithoutTypename)).toBe(
      getPersistedQueryHash(queryWithTypename),
    );
  });
});
