import type { prisma } from '@/lib/prisma/prisma';
import type { UserRole } from '../user';

/**
 * GraphQL context interface - available to all resolvers
 */
export interface GraphQLContext {
  userId?: string;
  role?: UserRole;
  operationName?: string | null;
  prisma: typeof prisma;
}
