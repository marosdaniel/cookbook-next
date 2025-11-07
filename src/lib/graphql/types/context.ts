export type UserRole = 'ADMIN' | 'USER' | 'BLOGGER';

/**
 * GraphQL context interface - available to all resolvers
 */
export interface IContext {
  userId?: string;
  role?: UserRole;
  operationName?: string | null;
}
