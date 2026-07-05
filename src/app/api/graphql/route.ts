import { AsyncLocalStorage } from 'node:async_hooks';
import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import { ApolloArmor } from '@escape.tech/graphql-armor';
import type { Session } from 'next-auth';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  createIsFavoriteLoader,
  createRatingsLoader,
  createRecipeAuthorLoader,
  createUserFavoriteRecipesLoader,
  createUserRatingLoader,
  createUserRecipesLoader,
} from '@/lib/dataloader/loaders';
import { validatePersistedQuery } from '@/lib/graphql/protection';
import { canUserPerformOperation } from '@/lib/graphql/operationsConfig';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import { prisma } from '@/lib/prisma/prisma';
import { createPrismaTimeoutProxy } from '@/lib/prisma/prismaTimeout';
import { getRateLimiterForOperation, rateLimiter } from '@/lib/rateLimit/rateLimit';
import { withTimeout } from '@/lib/redis/redis';
import type { GraphQLContext } from '../../../types/graphql/context';

const prismaWithTimeout = createPrismaTimeoutProxy(prisma, 10000);

const requestStorage = new AsyncLocalStorage<{
  session: Session | null;
}>();

/**
 * Plugin to log GraphQL operations (development only)
 */
const loggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return {
      async didResolveOperation(requestContext) {
        const { operationName } = requestContext.request;
        console.log(`[GraphQL] Operation: ${operationName || 'anonymous'}`);
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
        const { operationName } = requestContext.request;
        const { role } = requestContext.contextValue;

        // Check operation permissions
        if (operationName && !canUserPerformOperation(operationName, role)) {
          throw new GraphQLError(
            `Unauthorized: You don't have permission to perform '${operationName}'`,
            {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
                requiredRole: role || 'Authenticated user',
              },
            },
          );
        }
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

const fieldAuthPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return {
      async executionDidStart() {
        return {
          willResolveField({ contextValue, info, source }) {
            if (info.parentType.name !== 'User' || info.fieldName !== 'email') {
              return;
            }

            const currentUserId = contextValue.userId;
            const targetUserId = source?.id;

            if (currentUserId && targetUserId && currentUserId === targetUserId) {
              return;
            }

            if (contextValue.role === 'ADMIN') {
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
    ...(process.env.NODE_ENV === 'development' ? [loggingPlugin] : []),
    authPlugin,
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
        prisma: prismaWithTimeout,
        // DataLoaders are instantiated fresh per request so their internal
        // cache is scoped to a single request and never leaks between users.
        loaders: {
          ratings: createRatingsLoader(prismaWithTimeout),
          isFavorite: userId ? createIsFavoriteLoader(prismaWithTimeout, userId) : null,
          userRating: userId ? createUserRatingLoader(prismaWithTimeout, userId) : null,
          recipeAuthor: createRecipeAuthorLoader(prismaWithTimeout),
          userRecipes: createUserRecipesLoader(prismaWithTimeout),
          userFavoriteRecipes: createUserFavoriteRecipesLoader(prismaWithTimeout),
        },
      };
    },
  },
);

export const maxDuration = 30;

const wrappedHandler = async (
  request: NextRequest,
  _context: { params: Promise<Record<string, never>> },
): Promise<Response> => {
  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        message: 'GraphQL API endpoint. Use POST requests.',
        endpoint: '/api/graphql',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const session = await auth();
  const userId = session?.user?.id;

  const requestBody = await request.text();
  if (!requestBody.trim()) {
    return new Response(
      JSON.stringify({
        error: 'Empty request body',
        message: 'GraphQL POST requests must include a JSON body.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let operationName: string | undefined;
  try {
    const parsedBody = JSON.parse(requestBody) as {
      operationName?: string;
      query?: string;
      extensions?: {
        persistedQuery?: {
          sha256Hash?: string;
        };
      };
    };

    operationName = parsedBody.operationName ?? parsedBody.query?.match(/(?:query|mutation)\s+(\w+)/i)?.[1];
  } catch {
    operationName = undefined;
  }

  // Apply rate limiting
  if (rateLimiter) {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';
    const limiter = getRateLimiterForOperation(operationName as never) ?? rateLimiter;

    try {
      const rateLimitResult = await withTimeout(() => limiter.limit(userId ?? ip), 750);

      if (rateLimitResult) {
        const { success, limit, remaining } = rateLimitResult;

        if (!success) {
          return new Response(JSON.stringify({ error: 'Too many requests' }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
            },
          });
        }
      }
    } catch (error) {
      console.warn('GraphQL rate limiter failed. Continuing without throttling.', error);
    }
  }

  try {
    const parsedBody = JSON.parse(requestBody) as {
      query?: string;
      extensions?: {
        persistedQuery?: {
          sha256Hash?: string;
        };
      };
    };

    const persistedHash = parsedBody.extensions?.persistedQuery?.sha256Hash;
    if (persistedHash && !validatePersistedQuery(parsedBody.query ?? '', persistedHash)) {
      return new Response(
        JSON.stringify({
          error: 'Persisted query verification failed',
          message: 'The provided persisted query hash does not match the supplied operation.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON body',
        message: 'GraphQL POST requests must include valid JSON.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const replayedRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: requestBody,
    duplex: 'half',
  });

  return requestStorage.run({ session }, () => handler(replayedRequest));
};

// Export Next.js route handlers
export const POST = wrappedHandler;
