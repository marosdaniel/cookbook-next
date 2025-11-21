import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { canUserPerformOperation } from '@/lib/graphql/operationsConfig';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import type { IContext } from '@/lib/graphql/types/common';
import { prisma } from '@/lib/prisma';

/**
 * Plugin to log GraphQL operations (development only)
 */
const loggingPlugin: ApolloServerPlugin<IContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<IContext>> {
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
const authPlugin: ApolloServerPlugin<IContext> = {
  async requestDidStart(): Promise<GraphQLRequestListener<IContext>> {
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
const server = new ApolloServer<IContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
  plugins: [loggingPlugin, authPlugin],
  introspection: true,
});

/**
 * Create GraphQL context for each request
 */
const handler = startServerAndCreateNextHandler<NextRequest, IContext>(server, {
  context: async (): Promise<IContext> => {
    // Get NextAuth session
    const session = await getServerSession(authOptions);

    return {
      userId: session?.user?.id,
      role: session?.user?.role,
      operationName: null,
      prisma,
    };
  },
});

async function wrappedHandler(
  request: NextRequest,
  _context: { params: Promise<Record<string, never>> },
): Promise<Response> {
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

  return handler(request);
}

// Export Next.js route handlers
export const POST = wrappedHandler;
