import type { UserRole as PrismaUserRole } from '@prisma/client';
import type { GetUserByIdQuery } from '@/lib/graphql/generated/graphql';
import type { Locale } from './common';

// Re-export Prisma UserRole as the canonical type
export type { UserRole } from '@prisma/client';

/**
 * Base User type - shared fields across all contexts
 */
type GeneratedUser = GetUserByIdQuery['getUserById'];

export type BaseUser = Omit<
  Pick<
    GeneratedUser,
    'id' | 'userName' | 'firstName' | 'lastName' | 'role' | 'locale'
  >,
  'role' | 'locale'
> & {
  role: PrismaUserRole;
  locale: Locale;
};

/**
 * Session User type for NextAuth
 * Extends BaseUser with session-specific fields
 */
export type SessionUser = BaseUser & {
  email?: string; // Optional in session
};
