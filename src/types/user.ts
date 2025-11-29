import type { UserRole as PrismaUserRole } from '@prisma/client';

// Re-export Prisma UserRole as the canonical type
export type { UserRole } from '@prisma/client';

/**
 * Base User type - shared fields across all contexts
 */
export type BaseUser = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: PrismaUserRole;
  locale: string;
};

/**
 * Full User type with all database fields
 * Used in GraphQL operations and backend
 */
export type User = BaseUser & {
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Session User type for NextAuth
 * Extends BaseUser with session-specific fields
 */
export type SessionUser = BaseUser & {
  email?: string; // Optional in session
  rememberMe?: boolean;
};

// Re-export API-specific types for convenience
export type { UserRegisterInput } from './api/user';
