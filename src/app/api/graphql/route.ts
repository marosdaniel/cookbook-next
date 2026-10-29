import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloArmor } from '@escape.tech/graphql-armor';
import { GraphQLError } from 'graphql';
import { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/lib/auth/auth';
import {
  createIsFavoriteLoader,
  createRatingsLoader,
  createRecipeAuthorLoader,
  createUserFavoriteRecipesLoader,
  createUserRatingLoader,
  createUserRecipesLoader,
} from '@/lib/dataloader/loaders';
import { canResolveUserField } from '@/lib/graphql/fieldPolicies';
import { allowlistPlugin } from '@/lib/graphql/plugins/allowlist';
import { rateLimitPlugin } from '@/lib/graphql/plugins/rateLimit';
import { rootFieldAuthPlugin } from '@/lib/graphql/plugins/rootFieldAuth';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import { prisma } from '@/lib/prisma/prisma';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import { rateLimiter } from '@/lib/rateLimit/rateLimit';
import { withTimeout } from '@/lib/redis/redis';
import type { GraphQLContext } from '../../../types/graphql/context';

const MAX_GRAPHQL_BODY_BYTES = 1_048_576;

const requestStorage = new AsyncLocalStorage<{
  session: Session | null;
  requestId: string;
  clientKey: string;
}>();

/**
 * Plugin to emit structured GraphQL request logs for monitoring and audit purposes.
 */
const loggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(
    requestContext,
  ): Promise<GraphQLRequestListener<GraphQLContext>> {
    const startedAt = performance.now();
    let errorCode: string | undefined;
    return Promise.resolve({
      didResolveOperation(requestContext) {
        const { operationName } = requestContext;
        requestContext.contextValue.operationName = operationName;
        return Promise.resolve();
      },
      didEncounterErrors({ errors }) {
        errorCode = errors[0]?.extensions?.code?.toString();
        return Promise.resolve();
      },
      willSendResponse({ contextValue, response }) {
        const status = response.http?.status ?? (errorCode ? 500 : 200);
        console.info(
          JSON.stringify({
            event: 'graphql.request',
            requestId: contextValue.requestId ?? 'unknown',
            operationName:
              contextValue.operationName ?? requestContext.operationName,
            durationMs: Math.round(performance.now() - startedAt),
            status,
            userClass: contextValue.userId ? 'authenticated' : 'anonymous',
            ...(errorCode ? { errorCode } : {}),
          }),
        );
        return Promise.resolve();
      },
    });
  },
};

// Configure GraphQL Armor
const armor = new ApolloArmor({
  maxDepth: {
    enabled: true,
    n: 7, // Prevent deeply nested queries that could cause performance issues or DoS
  },
  costLimit: {
    enabled: true,
    maxCost: 1000,
  },
  maxAliases: {
    enabled: true,
    n: 15,
  },
  maxDirectives: {
    enabled: true,
    n: 50,
  },
  maxTokens: {
    enabled: true,
    n: 1000,
  },
});

const protection = armor.protect();

const fieldAuthPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return Promise.resolve({
      executionDidStart() {
        return Promise.resolve({
          willResolveField({ contextValue, info, source }) {
            if (info.parentType.name !== 'User') {
              return;
            }

            if (canResolveUserField(info.fieldName, source, contextValue)) {
              return;
            }

            throw new GraphQLError('Unauthorized field access', {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
              },
            });
          },
        });
      },
    });
  },
};

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
  plugins: [
    ...protection.plugins,
    loggingPlugin,
    allowlistPlugin,
    rootFieldAuthPlugin,
    rateLimitPlugin,
    fieldAuthPlugin,
  ],
  validationRules: [...protection.validationRules],
  introspection: process.env.NODE_ENV !== 'production',
  allowBatchedHttpRequests: false,
  formatError: (formattedError) => {
    const publicErrorCodes = new Set([
      'BAD_USER_INPUT',
      'BAD_REQUEST',
      'PERSISTED_QUERY_NOT_ALLOWED',
      'UNAUTHENTICATED',
      'FORBIDDEN',
      'NOT_FOUND',
      'RATE_LIMITED',
    ]);

    const code = formattedError.extensions?.code?.toString();
    const isProduction = process.env.NODE_ENV === 'production';

    const extensions = { ...(formattedError.extensions ?? undefined) };
    delete extensions.stacktrace;
    delete extensions.exception;

    if (isProduction && !publicErrorCodes.has(code ?? '')) {
      return {
        message: 'Internal server error',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      };
    }

    return {
      ...formattedError,
      extensions,
    };
  },
});

const resolveSessionSafely = async (): Promise<Session | null> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

/**
 * Create GraphQL context for each request
 */
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (): Promise<GraphQLContext> => {
      const store = requestStorage.getStore();
      const session = store ? store.session : await resolveSessionSafely();
      const userId = session?.user?.id;

      return {
        userId,
        role: session?.user?.role,
        operationName: null,
        requestId: store?.requestId ?? 'unknown',
        clientKey: store?.clientKey,
        prisma,
        // DataLoaders are instantiated fresh per request so their internal
        // cache is scoped to a single request and never leaks between users.
        loaders: {
          ratings: createRatingsLoader(prisma),
          isFavorite: userId ? createIsFavoriteLoader(prisma, userId) : null,
          userRating: userId ? createUserRatingLoader(prisma, userId) : null,
          recipeAuthor: createRecipeAuthorLoader(prisma),
          userRecipes: createUserRecipesLoader(prisma),
          userFavoriteRecipes: createUserFavoriteRecipesLoader(prisma),
        },
      };
    },
  },
);

export const maxDuration = 30;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type GraphQLRequestPayload = {
  operationName?: string;
  query?: string;
};

const createJsonResponse = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Vary: 'Cookie, Authorization',
      ...headers,
    },
  });
};

const parseRequestPayload = (requestBody: string): GraphQLRequestPayload => {
  return JSON.parse(requestBody);
};

const enforceGlobalRateLimit = async (
  clientKey: string,
): Promise<Response | null> => {
  const limiter = rateLimiter;
  if (!limiter) {
    return null;
  }

  try {
    const rateLimitResult = await withTimeout(
      () => limiter.limit(clientKey),
      750,
    );

    if (!rateLimitResult) {
      return null;
    }

    const { success, limit, remaining } = rateLimitResult;

    if (success) {
      return null;
    }

    return createJsonResponse({ error: 'Too many requests' }, 429, {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
    });
  } catch (error) {
    console.warn('GraphQL global rate limiter failed.', error);
    return null;
  }
};

const wrappedHandler = async (
  request: Request,
  _context?: { params?: Promise<Record<string, never>> },
): Promise<Response> => {
  if (request.method !== 'POST') {
    return createJsonResponse(
      {
        error: 'Method not allowed',
        message: 'GraphQL requests must use POST.',
      },
      405,
      { Allow: 'POST' },
    );
  }

  const session = await resolveSessionSafely();
  const requestId = request.headers.get('x-request-id') || randomUUID();
  const clientKey = getRateLimitClientKey(request);

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return createJsonResponse(
      {
        error: 'Unsupported media type',
        message: 'GraphQL POST requests must use application/json.',
      },
      415,
    );
  }

  const contentLength = request.headers.get('content-length');
  if (
    contentLength &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > MAX_GRAPHQL_BODY_BYTES
  ) {
    return createJsonResponse(
      { error: 'GraphQL request body is too large' },
      413,
    );
  }

  const requestBody = await request.text();
  if (
    new TextEncoder().encode(requestBody).byteLength > MAX_GRAPHQL_BODY_BYTES
  ) {
    return createJsonResponse(
      { error: 'GraphQL request body is too large' },
      413,
    );
  }

  if (!requestBody.trim()) {
    return createJsonResponse(
      {
        error: 'Empty request body',
        message: 'GraphQL POST requests must include a JSON body.',
      },
      400,
    );
  }

  try {
    parseRequestPayload(requestBody);
  } catch {
    return createJsonResponse(
      {
        error: 'Invalid JSON body',
        message: 'GraphQL POST requests must include valid JSON.',
      },
      400,
    );
  }

  const rateLimitResponse = await enforceGlobalRateLimit(clientKey);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const replayedRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: requestBody,
    duplex: 'half',
  });

  try {
    const response = await requestStorage.run(
      { session, requestId, clientKey },
      () => handler(replayedRequest),
    );

    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Vary', 'Cookie, Authorization');
    response.headers.set('X-Request-Id', requestId);

    return response;
  } catch (error) {
    console.error('Unhandled GraphQL route error:', error);
    return createJsonResponse(
      {
        errors: [
          {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      },
      500,
      { 'X-Request-Id': requestId },
    );
  }
};

// Export Next.js route handlers
export const POST = wrappedHandler;
export { wrappedHandler };
