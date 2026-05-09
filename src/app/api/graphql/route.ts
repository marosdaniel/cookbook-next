import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
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

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
  plugins: [loggingPlugin, authPlugin],
  introspection: process.env.NODE_ENV !== 'production',
  validationRules: [
    // Prevent deeply nested queries that could cause performance issues or DoS
    depthLimit(7),
  ],
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

      return {
        userId: session?.user?.id,
        role: session?.user?.role,
        operationName: null,
        prisma,
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

  return handler(request);
};

// Export Next.js route handlers
export const POST = wrappedHandler;
