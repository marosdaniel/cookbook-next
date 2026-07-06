import { describe, expect, it } from 'vitest';
import * as mutations from './mutations';
import * as queries from './queries';

describe('GraphQL document exports', () => {
  it('exports query documents with expected operation names', () => {
    expect(queries.GET_RECIPE_BY_ID).toBeDefined();
    expect(queries.GET_USER_BY_ID).toBeDefined();
    expect(queries.GET_LATEST_RECIPES).toBeDefined();

    const querySource = queries.GET_RECIPE_BY_ID.loc?.source.body ?? '';
    expect(querySource).toContain('query getRecipeById');
  });

  it('exports mutation documents with expected operation names', () => {
    expect(mutations.CREATE_USER).toBeDefined();
    expect(mutations.RESET_PASSWORD).toBeDefined();
    expect(mutations.CREATE_RECIPE).toBeDefined();

    const mutationSource = mutations.CREATE_USER.loc?.source.body ?? '';
    expect(mutationSource).toContain('mutation createUser');
  });
});
