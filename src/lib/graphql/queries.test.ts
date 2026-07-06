import { describe, expect, it } from 'vitest';
import {
  GET_ALL_METADATA,
  GET_FAVORITE_RECIPES,
  GET_RECIPE_BY_ID,
  GET_USER_BY_ID,
} from './queries';

describe('GraphQL query documents', () => {
  it('exports the expected user and recipe query documents', () => {
    expect(GET_USER_BY_ID).toBeDefined();
    expect(GET_RECIPE_BY_ID).toBeDefined();
    expect(GET_FAVORITE_RECIPES).toBeDefined();
    expect(GET_ALL_METADATA).toBeDefined();
  });
});
