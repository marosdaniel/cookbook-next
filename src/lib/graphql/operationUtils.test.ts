import { describe, expect, it } from 'vitest';

import {
  extractOperationName,
  getOperationNameFromRequest,
  getQueryFromRequest,
  isIntrospectionQuery,
} from './operationUtils';

describe('operationUtils', () => {
  it('extracts the first field name from a valid query', () => {
    expect(extractOperationName('query GetRecipes { recipes { id } }')).toBe(
      'recipes',
    );
  });

  it('returns null for invalid or non-operational GraphQL text', () => {
    expect(extractOperationName('not a graphql query')).toBeNull();
    expect(extractOperationName('fragment RecipeFragment on Recipe { id }')).toBeNull();
  });

  it('reads the query from a request body', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ query: 'query TestQuery { hello }' }),
    });

    await expect(getQueryFromRequest(req)).resolves.toBe('query TestQuery { hello }');
  });

  it('returns null when the request body is not valid JSON', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not-json',
    });

    await expect(getQueryFromRequest(req)).resolves.toBeNull();
  });

  it('uses operationName from the request body before parsing the query', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ operationName: 'ExplicitOperation' }),
    });

    await expect(getOperationNameFromRequest(req)).resolves.toBe('ExplicitOperation');
  });

  it('falls back to parsing the query when no operationName is provided', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ query: 'query ParsedQuery { hello }' }),
    });

    await expect(getOperationNameFromRequest(req)).resolves.toBe('hello');
  });

  it('returns null when the request body contains no operation details', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
    });

    await expect(getOperationNameFromRequest(req)).resolves.toBeNull();
  });

  it('detects introspection queries correctly', () => {
    expect(isIntrospectionQuery('IntrospectionQuery')).toBe(true);
    expect(isIntrospectionQuery('GetRecipes')).toBe(false);
  });
});
