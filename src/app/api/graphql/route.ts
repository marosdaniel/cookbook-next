import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { canUserPerformOperation } from '@/lib/graphql/operationsConfig';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import type { IContext } from '@/lib/graphql/types/common';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '../../../lib/graphql/types/user';

// JWT payload structure
interface JWTPayload {
  userId: string;
  role: UserRole;
}

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
 * Extract authorization header from Next.js request
 */
function getAuthorizationHeader(req: NextRequest): string {
  const authHeader = req.headers.get('authorization');
  return authHeader || '';
}

/**
 * Extract and verify JWT token from authorization header
 */
function extractUserFromToken(
  authHeader: string,
): Pick<IContext, 'userId' | 'role'> | null {
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'secret',
    ) as JWTPayload;

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    // Invalid or expired token
    return null;
  }
}

/**
 * Create GraphQL context for each request
 */
const handler = startServerAndCreateNextHandler<NextRequest, IContext>(server, {
  context: async (req: NextRequest): Promise<IContext> => {
    const authHeader = getAuthorizationHeader(req);
    const user = extractUserFromToken(authHeader);

    return {
      userId: user?.userId,
      role: user?.role,
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
