import type {
  QueryGetUserByIdArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getUserById = async (
  _: unknown,
  { id }: RequireFields<QueryGetUserByIdArgs, 'id'>,
  _context: GraphQLContext,
) => {
  return await UserService.getUserById(id);
};
