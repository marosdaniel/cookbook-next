// User-related types for GraphQL operations

import type { Locale } from '../../../types/common';
import type { OperationResponse } from './common';

export type UserRole = 'ADMIN' | 'USER' | 'BLOGGER';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: UserRole;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
};

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
  userNameOrEmail: string;
  password: string;
};

export type UserEditInput = {
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

export type EditUserArgs = {
  id: string;
  userEditInput: UserEditInput;
};

export type ChangePasswordArgs = {
  id: string;
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
