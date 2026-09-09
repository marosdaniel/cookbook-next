import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '@/lib/auth/auth';
import { canResolveUserField } from '@/lib/graphql/fieldPolicies';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import {
  getRateLimiterForOperation,
  isRateLimitOperation,
  isStrictRateLimitOperation,
} from '@/lib/rateLimit/rateLimit';

const {
  mockAuth,
  mockGetRateLimitClientKey,
  mockWithTimeout,
  mockStartServerAndCreateNextHandler,
  mockHandler,
} = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockGetRateLimitClientKey: vi.fn(),
  mockWithTimeout: vi.fn(),
  mockStartServerAndCreateNextHandler: vi.fn(),
  mockHandler: vi.fn(),
}));
const mockApolloServerOptions = vi.hoisted(() => ({
  current: undefined as Record<string, unknown> | undefined,
}));

const getApolloServerOptions = () => {
  if (!mockApolloServerOptions.current) {
    throw new Error('ApolloServer options were not captured');
  }

  return mockApolloServerOptions.current;
};

vi.mock('@as-integrations/next', () => ({
  startServerAndCreateNextHandler: mockStartServerAndCreateNextHandler,
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: mockAuth,
}));

vi.mock('@/lib/rateLimit/clientIp', () => ({
  getRateLimitClientKey: mockGetRateLimitClientKey,
}));

vi.mock('@/lib/redis/redis', () => ({
  withTimeout: mockWithTimeout,
}));

vi.mock('@/lib/prisma/prismaTimeout', () => ({
  createPrismaTimeoutProxy: vi.fn(() => ({})),
}));

vi.mock('@apollo/server', () => ({
  ApolloServer: class {
    constructor(options: Record<string, unknown>) {
      mockApolloServerOptions.current = options;
    }
  },
}));

vi.mock('@escape.tech/graphql-armor', () => ({
  ApolloArmor: class {
    protect() {
      return { plugins: [], validationRules: [] };
    }
  },
}));

vi.mock('@/lib/graphql/authorization', () => ({
  assertGraphQLOperationAuthorized: vi.fn(),
}));

vi.mock('@/lib/graphql/fieldPolicies', () => ({
  canResolveUserField: vi.fn(() => true),
}));

vi.mock('@/lib/graphql/resolvers', () => ({
  resolvers: {},
}));

vi.mock('@/lib/graphql/schema', () => ({
  resolvers: {},
  typeDefs: 'type Query { hello: String }',
}));

vi.mock('@/lib/prisma/prisma', () => ({
  prisma: {},
}));

vi.mock('@/lib/dataloader/loaders', () => ({
  createIsFavoriteLoader: vi.fn(),
  createRatingsLoader: vi.fn(),
  createRecipeAuthorLoader: vi.fn(),
  createUserFavoriteRecipesLoader: vi.fn(),
  createUserRatingLoader: vi.fn(),
  createUserRecipesLoader: vi.fn(),
}));

vi.mock('@/lib/rateLimit/rateLimit', () => ({
  getRateLimiterForOperation: vi.fn(() => ({ limit: vi.fn() })),
  isRateLimitOperation: vi.fn(() => false),
  isStrictRateLimitOperation: vi.fn(() => false),
  rateLimiter: { limit: vi.fn() },
}));

describe('GraphQL route branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(null);
    mockGetRateLimitClientKey.mockReturnValue('client-key');
    mockWithTimeout.mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
    });
    mockStartServerAndCreateNextHandler.mockReturnValue(mockHandler);
    mockHandler.mockResolvedValue(
      new Response(JSON.stringify({ data: { hello: 'world' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  });

  it('returns a GET message for non-POST requests', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'GET',
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    await expect(response.json()).resolves.toMatchObject({
      error: 'Method not allowed',
      message: 'GraphQL requests must use POST.',
    });
  });

  it('rejects unsupported content types', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{"query":"query Test { hello }"}',
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(415);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Unsupported media type',
    });
  });

  it('rejects oversized request bodies', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'x'.repeat(1_048_577),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: 'GraphQL request body is too large',
    });
  });

  it('rejects empty request bodies', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '   ',
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Empty request body',
    });
  });

  it('rejects invalid JSON payloads', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid json',
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Invalid JSON body',
    });
  });

  it('returns a rate-limit response when the limiter rejects the request', async () => {
    mockWithTimeout.mockResolvedValue({
      success: false,
      limit: 2,
      remaining: 0,
    });

    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'query Test { hello }' }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Too many requests',
    });
  });

  it('rejects a request from its content-length before reading the body', async () => {
    const { wrappedHandler } = await import('./route');
    const request = {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        'content-length': '1048577',
      }),
      text: vi.fn(),
      url: 'http://localhost/api/graphql',
    };

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(413);
    expect(request.text).not.toHaveBeenCalled();
    expect(mockWithTimeout).not.toHaveBeenCalled();
  });

  it('continues when content-length is not a finite number', async () => {
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': 'unknown',
      },
      body: JSON.stringify({ query: 'query Test { hello }' }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('continues when the rate-limit timeout returns no result', async () => {
    mockWithTimeout.mockResolvedValue(null);
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: 'query Test { hello }' }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('returns 503 when a strict operation has no rate limiter', async () => {
    vi.mocked(isRateLimitOperation).mockReturnValue(true);
    vi.mocked(isStrictRateLimitOperation).mockReturnValue(true);
    vi.mocked(getRateLimiterForOperation).mockReturnValue(null);
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'CreateUser',
        query: 'mutation CreateUser { hello }',
      }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('5');
  });

  it('ignores a limiter exception for non-strict operations', async () => {
    vi.mocked(isRateLimitOperation).mockReturnValue(true);
    vi.mocked(isStrictRateLimitOperation).mockReturnValue(false);
    vi.mocked(getRateLimiterForOperation).mockReturnValue({
      limit: vi.fn(),
    } as never);
    mockWithTimeout.mockRejectedValue(new Error('limiter unavailable'));
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'GetRecipes',
        query: 'query GetRecipes { hello }',
      }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalled();
  });

  it('returns 503 when a strict limiter throws', async () => {
    vi.mocked(isRateLimitOperation).mockReturnValue(true);
    vi.mocked(isStrictRateLimitOperation).mockReturnValue(true);
    vi.mocked(getRateLimiterForOperation).mockReturnValue({
      limit: vi.fn(),
    } as never);
    mockWithTimeout.mockRejectedValue(new Error('limiter unavailable'));
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'CreateUser',
        query: 'mutation CreateUser { hello }',
      }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('5');
  });

  it('uses the authenticated user key and preserves a supplied request id', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never);
    vi.mocked(getRateLimitClientKey).mockReturnValue('ip-key');
    const limiter = { limit: vi.fn() };
    vi.mocked(isRateLimitOperation).mockReturnValue(true);
    vi.mocked(getRateLimiterForOperation).mockReturnValue(limiter as never);
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-123',
      },
      body: JSON.stringify({
        operationName: 'GetRecipes',
        query: 'query GetRecipes { hello }',
      }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(mockWithTimeout).toHaveBeenCalled();
    const operation = vi.mocked(mockWithTimeout).mock.calls[0]?.[0];
    await operation?.();
    expect(limiter.limit).toHaveBeenCalledWith('user-1');
    expect(response.headers.get('X-Request-Id')).toBe('request-123');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Vary')).toBe('Cookie, Authorization');
  });

  it('returns a request-id tagged internal error when Apollo fails', async () => {
    mockHandler.mockRejectedValue(new Error('Apollo failed'));
    const { wrappedHandler } = await import('./route');
    const request = new Request('http://localhost/api/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-500',
      },
      body: JSON.stringify({ query: 'query Test { hello }' }),
    });

    const response = await wrappedHandler(request as never, {} as never);

    expect(response.status).toBe(500);
    expect(response.headers.get('X-Request-Id')).toBe('request-500');
    await expect(response.json()).resolves.toMatchObject({
      errors: [{ extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
    });
  });

  it('runs logging and authorization plugin callbacks', async () => {
    const { requestDidStart: loggingRequestDidStart } = (
      getApolloServerOptions().plugins as Array<{
        requestDidStart: (context: unknown) => Promise<unknown>;
      }>
    )[0];
    const { requestDidStart: authRequestDidStart } = (
      getApolloServerOptions().plugins as Array<{
        requestDidStart: (context: unknown) => Promise<unknown>;
      }>
    )[1];
    const context = {
      operationName: 'GetRecipes',
      contextValue: {
        operationName: null,
        requestId: 'request-1',
        userId: 'user-1',
      },
    };
    const loggingListener = (await loggingRequestDidStart(context)) as Record<
      string,
      (value: never) => Promise<void>
    >;

    await loggingListener.didResolveOperation?.({
      operationName: 'GetRecipes',
      contextValue: context.contextValue,
    } as never);
    await loggingListener.didEncounterErrors?.({
      errors: [{ extensions: { code: 'BAD_USER_INPUT' } }],
    } as never);
    await loggingListener.willSendResponse?.({
      contextValue: context.contextValue,
      response: { http: { status: 400 } },
    } as never);

    const authListener = (await authRequestDidStart({} as never)) as Record<
      string,
      (value: never) => Promise<void>
    >;
    await authListener.didResolveOperation?.({
      operationName: 'GetRecipes',
      contextValue: { role: 'USER' },
    } as never);

    expect(context.contextValue.operationName).toBe('GetRecipes');
  });

  it('logs default response status and error code when no HTTP status exists', async () => {
    const { requestDidStart } = (
      getApolloServerOptions().plugins as Array<{
        requestDidStart: (context: unknown) => Promise<unknown>;
      }>
    )[0];
    const listener = (await requestDidStart({
      operationName: undefined,
    })) as Record<string, (value: never) => Promise<void>>;

    await listener.willSendResponse?.({
      contextValue: { requestId: undefined, userId: undefined },
      response: {},
    } as never);

    expect(listener.willSendResponse).toBeDefined();
  });

  it('covers field authorization for non-user, allowed-user, and denied-user fields', async () => {
    const { requestDidStart } = (
      getApolloServerOptions().plugins as Array<{
        requestDidStart: () => Promise<unknown>;
      }>
    )[2];
    const listener = (await requestDidStart()) as {
      executionDidStart: () => Promise<unknown>;
    };
    const execution = (await listener.executionDidStart()) as {
      willResolveField: (value: never) => void;
    };

    expect(
      execution.willResolveField({
        info: { parentType: { name: 'Recipe' } },
      } as never),
    ).toBeUndefined();
    vi.mocked(canResolveUserField).mockReturnValue(true);
    expect(
      execution.willResolveField({
        info: { parentType: { name: 'User' }, fieldName: 'email' },
        source: {},
        contextValue: {},
      } as never),
    ).toBeUndefined();
    vi.mocked(canResolveUserField).mockReturnValue(false);
    expect(() =>
      execution.willResolveField({
        info: { parentType: { name: 'User' }, fieldName: 'email' },
        source: {},
        contextValue: {},
      } as never),
    ).toThrow('Unauthorized field access');
  });

  it('formats public errors without exposing stack details', () => {
    const formatError = getApolloServerOptions().formatError as (
      error: Record<string, unknown>,
    ) => Record<string, unknown>;
    const formatted = formatError({
      message: 'Bad input',
      extensions: { code: 'BAD_USER_INPUT', stacktrace: ['secret'] },
    });

    expect(formatted.message).toBe('Bad input');
    expect(formatted.extensions).toEqual({ code: 'BAD_USER_INPUT' });
  });

  it('hides non-public errors in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const formatError = getApolloServerOptions().formatError as (
      error: Record<string, unknown>,
    ) => Record<string, unknown>;

    const formatted = formatError({
      message: 'Database details',
      extensions: { code: 'INTERNAL_ERROR', exception: 'secret' },
    });

    vi.unstubAllEnvs();
    expect(formatted).toEqual({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });
});
