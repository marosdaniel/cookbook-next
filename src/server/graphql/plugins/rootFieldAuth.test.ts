import {
  type DocumentNode,
  Kind,
  type OperationDefinitionNode,
  parse,
} from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockAssertOperationAuthorized } = vi.hoisted(() => ({
  mockAssertOperationAuthorized: vi.fn(),
}));

vi.mock('@/lib/graphql/authorization', () => ({
  assertGraphQLOperationAuthorized: mockAssertOperationAuthorized,
}));

import {
  assertGraphQLRootFieldsAuthorized,
  collectRootFields,
  getOperationRootFields,
  rootFieldAuthPlugin,
} from './rootFieldAuth';

const parseOperation = (source: string) => {
  const doc = parse(source);
  const op = doc.definitions.find(
    (def): def is OperationDefinitionNode =>
      def.kind === Kind.OPERATION_DEFINITION,
  );
  if (!op) throw new Error('no operation in test source');
  return { doc, op };
};

describe('collectRootFields', () => {
  it('collects root fields including those reached via fragments', () => {
    const { doc, op } = parseOperation(`
      query Home { recipes { id } ...RootFragment }
      fragment RootFragment on Query { me { id } }
    `);

    expect(collectRootFields(doc, op)).toEqual(['recipes', 'me']);
  });

  it('walks inline fragments', () => {
    const { doc, op } = parseOperation(`
      query Q { ... on Query { recipes { id } } }
    `);

    expect(collectRootFields(doc, op)).toEqual(['recipes']);
  });

  it('does not loop on fragments that spread each other', () => {
    const { doc, op } = parseOperation(`
      query Q { ...A }
      fragment A on Query { a: recipes { id } ...B }
      fragment B on Query { me { id } ...A }
    `);

    expect(collectRootFields(doc, op)).toEqual(['recipes', 'me']);
  });

  it('ignores unknown fragment spreads', () => {
    const { doc, op } = parseOperation(`
      query Q { recipes { id } ...Missing }
    `);

    expect(collectRootFields(doc, op)).toEqual(['recipes']);
  });
});

describe('getOperationRootFields', () => {
  it('drops __typename', () => {
    const { doc, op } = parseOperation(`
      query Q { __typename recipes { id } }
    `);

    expect(getOperationRootFields(doc, op)).toEqual(['recipes']);
  });
});

describe('assertGraphQLRootFieldsAuthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects operations without a name with BAD_REQUEST', () => {
    expect(() =>
      assertGraphQLRootFieldsAuthorized(undefined, undefined, null),
    ).toThrow('GraphQL operations must provide an operation name.');
    expect(mockAssertOperationAuthorized).not.toHaveBeenCalled();
  });

  it('falls back to the operation name when there is no document', () => {
    assertGraphQLRootFieldsAuthorized(
      undefined,
      undefined,
      'getRecipes',
      'USER',
    );

    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith(
      'getRecipes',
      'USER',
    );
  });

  it('falls back to the operation name when only __typename is selected', () => {
    const { doc, op } = parseOperation(`query Q { __typename }`);

    assertGraphQLRootFieldsAuthorized(doc, op, 'Q', 'USER');

    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith('Q', 'USER');
  });

  it('checks every root field against the caller role', () => {
    const { doc, op } = parseOperation(`
      query Q { recipes { id } me { id } }
    `);

    assertGraphQLRootFieldsAuthorized(doc, op, 'Q', 'ADMIN');

    expect(mockAssertOperationAuthorized).toHaveBeenCalledTimes(2);
    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith(
      'recipes',
      'ADMIN',
    );
    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith('me', 'ADMIN');
  });

  it('allows introspection roots outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { doc, op } = parseOperation(
      `query Q { __schema { types { name } } }`,
    );

    assertGraphQLRootFieldsAuthorized(doc, op, 'Q');

    expect(mockAssertOperationAuthorized).not.toHaveBeenCalledWith(
      '__schema',
      undefined,
    );
  });

  it('checks introspection roots in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { doc, op } = parseOperation(
      `query Q { __type(name: "X") { name } }`,
    );

    assertGraphQLRootFieldsAuthorized(doc, op, 'Q');

    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith(
      '__type',
      undefined,
    );
  });
});

describe('rootFieldAuthPlugin', () => {
  it('runs root-field authorization on didResolveOperation', async () => {
    const { doc, op } = parseOperation(`query Q { recipes { id } }`);
    const listener = await rootFieldAuthPlugin.requestDidStart?.({} as never);

    await listener?.didResolveOperation?.({
      document: doc as DocumentNode,
      operation: op,
      operationName: 'Q',
      contextValue: { role: 'USER' },
    } as never);

    expect(mockAssertOperationAuthorized).toHaveBeenCalledWith(
      'recipes',
      'USER',
    );
  });
});
