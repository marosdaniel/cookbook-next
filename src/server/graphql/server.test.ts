import type { GraphQLFormattedError } from 'graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockState, mockStartHandler, mockCreateContext } = vi.hoisted(() => ({
  mockState: {
    apolloConfig: undefined as
      | {
          introspection: boolean;
          formatError: (
            formatted: GraphQLFormattedError,
            error: unknown,
          ) => GraphQLFormattedError;
        }
      | undefined,
    armorOptions: undefined as Record<string, { enabled: boolean }> | undefined,
  },
  mockStartHandler: vi.fn(() => 'next-handler'),
  mockCreateContext: vi.fn(),
}));

vi.mock('@apollo/server', () => ({
  ApolloServer: class {
    constructor(config: typeof mockState.apolloConfig) {
      mockState.apolloConfig = config;
    }
  },
}));

vi.mock('@escape.tech/graphql-armor', () => ({
  ApolloArmor: class {
    constructor(options: Record<string, { enabled: boolean }>) {
      mockState.armorOptions = options;
    }
    protect() {
      return { plugins: [], validationRules: [] };
    }
  },
}));

vi.mock('@as-integrations/next', () => ({
  startServerAndCreateNextHandler: mockStartHandler,
}));
vi.mock('@/lib/graphql/resolvers', () => ({ resolvers: {} }));
vi.mock('@/lib/graphql/schema', () => ({
  typeDefs: 'type Query { ping: String }',
  resolvers: {},
}));
vi.mock('./context', () => ({ createGraphQLContext: mockCreateContext }));
vi.mock('./plugins', () => ({ graphqlPlugins: [] }));

type ServerModule = typeof import('./server');

const loadServer = async (nodeEnv: string): Promise<ServerModule> => {
  vi.stubEnv('NODE_ENV', nodeEnv);
  vi.resetModules();
  return import('./server');
};

const formatWith = (
  formatted: GraphQLFormattedError,
): GraphQLFormattedError => {
  if (!mockState.apolloConfig) {
    throw new Error('ApolloServer was not constructed');
  }
  return mockState.apolloConfig.formatError(formatted, new Error('x'));
};

describe('graphql server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.apolloConfig = undefined;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('configures ApolloArmor with depth, cost, alias, directive and token limits', async () => {
    await loadServer('test');

    expect(mockState.armorOptions).toMatchObject({
      maxDepth: { enabled: true, n: 7 },
      costLimit: { enabled: true, maxCost: 1000 },
      maxAliases: { enabled: true, n: 15 },
      maxDirectives: { enabled: true, n: 50 },
      maxTokens: { enabled: true, n: 1000 },
    });
  });

  it('enables introspection outside production', async () => {
    await loadServer('development');

    expect(mockState.apolloConfig?.introspection).toBe(true);
  });

  it('disables introspection in production', async () => {
    await loadServer('production');

    expect(mockState.apolloConfig?.introspection).toBe(false);
  });

  it('wires the Next.js handler with the GraphQL context factory', async () => {
    await loadServer('test');

    expect(mockStartHandler).toHaveBeenCalledWith(expect.anything(), {
      context: mockCreateContext,
    });
  });

  it('keeps public error codes unchanged in production', async () => {
    await loadServer('production');

    const formatted = formatWith({
      message: 'Forbidden',
      extensions: { code: 'FORBIDDEN', stacktrace: ['s'], exception: {} },
    } as GraphQLFormattedError);

    expect(formatted.message).toBe('Forbidden');
    expect(formatted.extensions).toEqual({ code: 'FORBIDDEN' });
  });

  it('masks non-public errors in production', async () => {
    await loadServer('production');

    const formatted = formatWith({
      message: 'db exploded',
      extensions: { code: 'SOMETHING_ELSE' },
    } as GraphQLFormattedError);

    expect(formatted).toEqual({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('masks errors without a code in production', async () => {
    await loadServer('production');

    const formatted = formatWith({
      message: 'no code',
    } as GraphQLFormattedError);

    expect(formatted.message).toBe('Internal server error');
  });

  it('strips stacktrace and exception details outside production', async () => {
    await loadServer('development');

    const formatted = formatWith({
      message: 'boom',
      extensions: { code: 'SOMETHING_ELSE', stacktrace: ['s'], exception: {} },
    } as GraphQLFormattedError);

    expect(formatted.message).toBe('boom');
    expect(formatted.extensions).toEqual({ code: 'SOMETHING_ELSE' });
  });
});
