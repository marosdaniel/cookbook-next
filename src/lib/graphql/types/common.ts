import type { prisma } from '@/lib/prisma';
import type { UserRole } from './user';

/**
 * GraphQL context interface - available to all resolvers
 */
export interface IContext {
  userId?: string;
  role?: UserRole;
  operationName?: string | null;
  prisma: typeof prisma;
}

export type OperationResponse = {
  success: boolean;
  message: string;
  messageKey: string;
  statusCode: number;
};
