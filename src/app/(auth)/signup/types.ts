import type { User, UserRegisterInput } from '@/lib/graphql/types/user';

export type SignUpPageProps = Record<string, never>;

// Client-side mutation types for Apollo Client
export type CreateUserData = {
  createUser: User;
};

export type CreateUserVars = {
  userRegisterInput: UserRegisterInput;
};
