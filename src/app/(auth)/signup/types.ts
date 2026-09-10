import type {
  CreateUserMutation,
  CreateUserMutationVariables,
} from '@/lib/graphql/generated/graphql';

// Client-side mutation types for Apollo Client
export type CreateUserData = CreateUserMutation;

export type CreateUserVars = CreateUserMutationVariables;
