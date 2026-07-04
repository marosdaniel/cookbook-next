import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import { ApolloArmor } from '@escape.tech/graphql-armor';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  createIsFavoriteLoader,
  createRatingsLoader,
  createUserRatingLoader,
} from '@/lib/dataloader/loaders';
import { validatePersistedQuery } from '@/lib/graphql/protection';
import { canUserPerformOperation } from '@/lib/graphql/operationsConfig';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import { prisma } from '@/lib/prisma/prisma';
import { rateLimiter } from '@/lib/rateLimit/rateLimit';
import type { GraphQLContext } from '../../../types/graphql/context';

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
  plugins: [...protection.plugins, loggingPlugin, authPlugin, fieldAuthPlugin],
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
      // Get NextAuth v5 session
      const session = await auth();
      const userId = session?.user?.id;

      return {
        userId,
        role: session?.user?.role,
        operationName: null,
        prisma,
        // DataLoaders are instantiated fresh per request so their internal
        // cache is scoped to a single request and never leaks between users.
        loaders: {
          ratings: createRatingsLoader(prisma),
          isFavorite: userId ? createIsFavoriteLoader(prisma, userId) : null,
          userRating: userId ? createUserRatingLoader(prisma, userId) : null,
        },
      };
    },
  },
);

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

  // Apply rate limiting
  if (rateLimiter) {
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1';

    const { success, limit, remaining } = await rateLimiter.limit(ip);

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

  const requestBody = await request.clone().text();
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

  return handler(request);
};

// Export Next.js route handlers
export const POST = wrappedHandler;
