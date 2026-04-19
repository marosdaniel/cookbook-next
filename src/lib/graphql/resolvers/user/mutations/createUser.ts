import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { CreateUserArgs } from '@/types/user';

export const createUser = async (
  _parent: unknown,
  { userRegisterInput }: CreateUserArgs,
  _context: GraphQLContext,
) => {
  return await UserService.createUser(userRegisterInput);
};
