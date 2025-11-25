import type { User, UserRegisterInput } from '@/lib/graphql/types/user';

// Client-side mutation types for Apollo Client
export type CreateUserData = {
  createUser: User;
};

export type CreateUserVars = {
  userRegisterInput: UserRegisterInput;
};
