import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getFollowing = async (
  _: unknown,
  { userId, limit }: { userId: string; limit?: number },
  _context: GraphQLContext,
) => {
  return await UserService.getFollowing(userId, limit);
};
