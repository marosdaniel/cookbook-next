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
    expect(resolveQueryLimit(undefined)).toBeUndefined();
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
});
