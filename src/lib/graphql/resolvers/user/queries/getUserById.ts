import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getUserById = async (
  _: unknown,
  { id }: { id: string },
  _context: GraphQLContext,
) => {
  return await UserService.getUserById(id);
};
