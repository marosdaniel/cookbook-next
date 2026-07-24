import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.fn();
const mockGetRateLimitClientKey = vi.fn();
const mockWithTimeout = vi.fn();
const mockStartServerAndCreateNextHandler = vi.fn();
const mockHandler = vi.fn();

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
  ApolloServer: class {},
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

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      message: 'GraphQL API endpoint. Use POST requests.',
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
});
