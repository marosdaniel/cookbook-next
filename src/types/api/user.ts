import type { Locale } from '../common';
import type { OperationResponse } from '../graphql/responses';
import type { User } from '../user';

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
