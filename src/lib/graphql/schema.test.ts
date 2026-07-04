import { print } from 'graphql';
import { describe, expect, it } from 'vitest';

import { typeDefs } from './schema';

describe('GraphQL schema', () => {
  it('defines the Recipe.author field expected by the resolver', () => {
    const schemaText = print(typeDefs);

    expect(schemaText).toContain('type Recipe');
    expect(schemaText).toContain('author: User!');
  });
});
