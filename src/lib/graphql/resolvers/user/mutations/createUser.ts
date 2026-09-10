import type { MutationCreateUserArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const createUser = async (
  _parent: unknown,
  { userRegisterInput }: Partial<MutationCreateUserArgs>,
  _context: GraphQLContext,
) => {
  if (!userRegisterInput) {
    throw new Error('User registration input is required');
  }
  return await UserService.createUser(userRegisterInput);
};
