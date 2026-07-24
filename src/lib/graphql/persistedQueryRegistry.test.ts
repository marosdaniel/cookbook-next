import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  isPersistedQueryAllowed,
  persistedQueryHashes,
} from './persistedQueryRegistry';
import { getPersistedQueryHashFromDocument } from './protection';
import { GET_LATEST_RECIPES } from './queries';

describe('persisted query registry', () => {
  it('contains the shipped client query documents', () => {
    const query = print(GET_LATEST_RECIPES);
    const hash = getPersistedQueryHashFromDocument(query);

    expect(persistedQueryHashes.size).toBe(21);
    expect(isPersistedQueryAllowed(query, hash)).toBe(true);
  });

  it('rejects a valid hash for an unregistered query', () => {
    const query = 'query getRecipes { getRecipes { totalRecipes } }';

    expect(
      isPersistedQueryAllowed(query, getPersistedQueryHashFromDocument(query)),
    ).toBe(false);
  });
});
