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
import { assertGraphQLOperationAuthorized } from '@/lib/graphql/authorization';
import { canResolveUserField } from '@/lib/graphql/fieldPolicies';
import { normalizeGraphQLOperationName } from '@/lib/graphql/operations';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import { prisma } from '@/lib/prisma/prisma';
import { createPrismaTimeoutProxy } from '@/lib/prisma/prismaTimeout';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import {
  getRateLimiterForOperation,
  isRateLimitOperation,
  isStrictRateLimitOperation,
  rateLimiter,
} from '@/lib/rateLimit/rateLimit';
import { withTimeout } from '@/lib/redis/redis';
import type { GraphQLContext } from '../../../types/graphql/context';

const prismaWithTimeout = createPrismaTimeoutProxy(prisma, 10000);
const MAX_GRAPHQL_BODY_BYTES = 1_048_576;

const requestStorage = new AsyncLocalStorage<{
  session: Session | null;
  requestId: string;
}>();

/**
 * Plugin to log GraphQL operations (development only)
 */
const loggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart(
    requestContext,
  ): Promise<GraphQLRequestListener<GraphQLContext>> {
    const startedAt = performance.now();
    let errorCode: string | undefined;
    return {
      async didResolveOperation(requestContext) {
        const { operationName } = requestContext;
        requestContext.contextValue.operationName = operationName;
      },
      async didEncounterErrors({ errors }) {
        errorCode = errors[0]?.extensions?.code?.toString();
      },
      async willSendResponse({ contextValue, response }) {
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
      },
    };
  },
};

/**
 * Plugin to validate operation permissions
 */
const authPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return {
      async didResolveOperation(requestContext) {
        const operationName = requestContext.operationName;
        const { role } = requestContext.contextValue;

        assertGraphQLOperationAuthorized(operationName, role);

        // Authorize the operation selected by Apollo after parsing the document.
        // The client-supplied HTTP operationName is not trusted for this check.
        requestContext.contextValue.operationName = operationName;
      },
    };
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

/**
 * Plugin to disable Apollo Server's built-in APQ validation.
 * APQ is disabled due to hash mismatches between client and server normalization.
 */
const disableAPQValidationPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation(requestContext) {
        // Remove the persisted query validation by clearing extensions
        // This prevents Apollo Server's built-in APQ plugin from rejecting queries
        if (requestContext.request.extensions?.persistedQuery) {
          delete requestContext.request.extensions.persistedQuery;
        }
      },
    };
  },
};

const fieldAuthPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return {
      async executionDidStart() {
        return {
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
        };
      },
    };
  },
};

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
  plugins: [
    ...protection.plugins,
    loggingPlugin,
    authPlugin,
    disableAPQValidationPlugin,
    fieldAuthPlugin,
  ],
  validationRules: [...protection.validationRules],
  introspection: process.env.NODE_ENV !== 'production',
  allowBatchedHttpRequests: false,
  formatError: (formattedError) => {
    const extensions = { ...(formattedError.extensions ?? undefined) };

    if (process.env.NODE_ENV === 'production') {
      delete extensions.stacktrace;
      delete extensions.exception;
    }

    return {
      ...formattedError,
      message:
        process.env.NODE_ENV === 'production' &&
        formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR'
          ? 'Internal server error'
          : formattedError.message,
      extensions,
    };
  },
});

/**
 * Create GraphQL context for each request
 */
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (): Promise<GraphQLContext> => {
      const session = requestStorage.getStore()?.session ?? (await auth());
      const userId = session?.user?.id;

      return {
        userId,
        role: session?.user?.role,
        operationName: null,
        requestId: requestStorage.getStore()?.requestId ?? 'unknown',
        prisma: prismaWithTimeout,
        // DataLoaders are instantiated fresh per request so their internal
        // cache is scoped to a single request and never leaks between users.
        loaders: {
          ratings: createRatingsLoader(prismaWithTimeout),
          isFavorite: userId
            ? createIsFavoriteLoader(prismaWithTimeout, userId)
            : null,
          userRating: userId
            ? createUserRatingLoader(prismaWithTimeout, userId)
            : null,
          recipeAuthor: createRecipeAuthorLoader(prismaWithTimeout),
          userRecipes: createUserRecipesLoader(prismaWithTimeout),
          userFavoriteRecipes:
            createUserFavoriteRecipesLoader(prismaWithTimeout),
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
  extensions?: {
    persistedQuery?: {
      version?: number;
      sha256Hash?: string;
    };
  };
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

const extractOperationName = (
  payload: GraphQLRequestPayload,
): string | undefined => {
  // Best-effort fallback for clients that omit operationName; this is only used
  // to select the rate limiter and is not used for authorization decisions.
  return normalizeGraphQLOperationName(
    payload.operationName ??
      payload.query?.match(/(?:query|mutation)\s+(\w+)/i)?.[1],
  );
};

const enforceRateLimit = async (
  request: Request,
  operationName: string | undefined,
  userId: string | undefined,
): Promise<Response | null> => {
  const clientKey = getRateLimitClientKey(request);
  const strictOperation = isStrictRateLimitOperation(operationName);
  const limiter = isRateLimitOperation(operationName)
    ? getRateLimiterForOperation(operationName)
    : rateLimiter;

  if (!limiter) {
    console.warn(
      `Rate limiter unavailable for ${operationName ?? 'unknown'}; proceeding without throttling.`,
    );
    return null;
  }

  try {
    const rateLimitResult = await withTimeout(
      () => limiter.limit(userId ?? clientKey),
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
    console.warn(
      `GraphQL ${strictOperation ? 'strict ' : ''}rate limiter failed.`,
      error,
    );

    if (strictOperation) {
      return createJsonResponse(
        { error: 'Rate limiter temporarily unavailable' },
        503,
        { 'Retry-After': '5' },
      );
    }

    return null;
  }
};

const validatePersistedQueryRequest = (
  _payload: GraphQLRequestPayload,
): Response | null => {
  // DISABLED: APQ validation due to persistent hash mismatches.
  // Client and server normalization of GraphQL queries differs,
  // causing valid queries to be rejected. Full queries are sent instead.
  return null;
};

const wrappedHandler = async (
  request: Request,
  _context?: { params?: Promise<Record<string, never>> },
): Promise<Response> => {
  if (request.method === 'GET') {
    return createJsonResponse(
      {
        message: 'GraphQL API endpoint. Use POST requests.',
        endpoint: '/api/graphql',
      },
      200,
    );
  }

  const session = await auth();
  const userId = session?.user?.id;
  const requestId = request.headers.get('x-request-id') || randomUUID();

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

  let payload: GraphQLRequestPayload;
  try {
    payload = parseRequestPayload(requestBody);
  } catch {
    return createJsonResponse(
      {
        error: 'Invalid JSON body',
        message: 'GraphQL POST requests must include valid JSON.',
      },
      400,
    );
  }

  const operationName = extractOperationName(payload);
  const rateLimitResponse = await enforceRateLimit(
    request,
    operationName,
    userId,
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const persistedQueryResponse = validatePersistedQueryRequest(payload);
  if (persistedQueryResponse) {
    return persistedQueryResponse;
  }

  const replayedRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: requestBody,
    duplex: 'half',
  });

  const response = await requestStorage.run({ session, requestId }, () =>
    handler(replayedRequest),
  );
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('Vary', 'Cookie, Authorization');
  headers.set('X-Request-Id', requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

// Export Next.js route handlers
export const POST = wrappedHandler;
export { wrappedHandler };
