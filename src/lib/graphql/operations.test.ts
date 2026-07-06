import { describe, expect, it } from 'vitest';
import {
  isKnownGraphQLOperation,
  KNOWN_OPERATION_NAMES,
  OPERATION_NAMES,
} from './operations';

describe('GraphQL operation helpers', () => {
  it('recognizes known operation names', () => {
    expect(OPERATION_NAMES.GET_RECIPE_BY_ID).toBe('getRecipeById');
    expect(KNOWN_OPERATION_NAMES.has(OPERATION_NAMES.GET_RECIPE_BY_ID)).toBe(
      true,
    );
    expect(isKnownGraphQLOperation('getRecipeById')).toBe(true);
    expect(isKnownGraphQLOperation('unknownOperation')).toBe(false);
    expect(isKnownGraphQLOperation(undefined)).toBe(false);
  });
});
