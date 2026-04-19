import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { LoginUserArgs } from '@/types/user';

export const loginUser = async (
  _parent: unknown,
  { userLoginInput }: LoginUserArgs,
  _context: GraphQLContext,
) => {
  return await UserService.loginUser(userLoginInput);
};
