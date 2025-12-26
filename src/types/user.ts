import type { UserRole as PrismaUserRole } from '@prisma/client';
import type { Locale } from './common';

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
  locale: Locale;
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

// --- API Types ---

import type { OperationResponse } from './graphql/responses';

// Mutation inputs
export type UserRegisterInput = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  locale?: Locale;
};

export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserUpdateInput = {
  firstName?: string;
  lastName?: string;
  locale?: Locale;
};

export type PasswordEditInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

// Mutation arguments
export type CreateUserArgs = {
  userRegisterInput: UserRegisterInput;
};

export type LoginUserArgs = {
  userLoginInput: UserLoginInput;
};

export type UpdateUserArgs = {
  userUpdateInput: UserUpdateInput;
};

export type ChangePasswordArgs = {
  passwordEditInput: PasswordEditInput;
};

// Mutation responses
export type AuthPayload = {
  token: string;
  user: User;
  userId: string;
};

export type UserOperationResponse = OperationResponse & {
  user?: User;
};
