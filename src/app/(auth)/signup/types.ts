import type { User, UserRegisterInput } from '@/types/user';

// Client-side mutation types for Apollo Client
export interface CreateUserData {
  createUser: {
    success: boolean;
    message: string;
    messageKey: string;
    user?: User;
  };
}

export interface CreateUserVars {
  userRegisterInput: UserRegisterInput;
}
