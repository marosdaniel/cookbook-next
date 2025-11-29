import type { User, UserRegisterInput } from '@/types/user';

// Client-side mutation types for Apollo Client
export interface CreateUserData {
  createUser: User;
}

export interface CreateUserVars {
  userRegisterInput: UserRegisterInput;
}
