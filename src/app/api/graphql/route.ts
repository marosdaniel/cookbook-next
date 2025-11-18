import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import {
  canUserPerformOperation,
  type UserRole,
} from '@/lib/graphql/operationsConfig';
import {
  getOperationNameFromRequest,
  isIntrospectionQuery,
} from '@/lib/graphql/operationUtils';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import type { IContext } from '@/lib/graphql/types/context';
import { prisma } from '@/lib/prisma';

// JWT payload structure
interface JWTPayload {
  userId: string;
  role: UserRole;
}

// Create Apollo Server instance
const server = new ApolloServer<IContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
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
 * Check if user has permission to perform the operation
 */
function checkOperationPermission(
  operationName: string | null,
  userRole?: UserRole,
): void {
  if (!operationName) {
    return;
  }

  if (!canUserPerformOperation(operationName, userRole)) {
    throw new GraphQLError(
      `Unauthorized: You don't have permission to perform '${operationName}'`,
      {
        extensions: {
          code: 'FORBIDDEN',
          http: { status: 403 },
          requiredRole: userRole || 'Authenticated user',
        },
      },
    );
  }
}

/**
 * Create GraphQL context for each request
 */
const handler = startServerAndCreateNextHandler<NextRequest, IContext>(server, {
  context: async (req: NextRequest): Promise<IContext> => {
    // Extract operation name from request
    const operationName = await getOperationNameFromRequest(req);

    // Allow introspection queries (GraphQL Playground, development)
    if (isIntrospectionQuery(operationName)) {
      return { operationName, prisma };
    }

    // Extract and verify user from JWT token
    const authHeader = getAuthorizationHeader(req);
    const user = extractUserFromToken(authHeader);

    // Check operation permissions
    checkOperationPermission(operationName, user?.role);

    // Return context with user data and Prisma client
    return {
      userId: user?.userId,
      role: user?.role,
      operationName,
      prisma,
    };
  },
});

// Export Next.js route handlers
export const GET = handler;
export const POST = handler;
