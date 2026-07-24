import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getFollowing = async (
  _: unknown,
  { limit }: { limit?: number },
  context: GraphQLContext,
) => {
  if (!context.userId) {
    throw new Error('Authentication required');
  }

  return await UserService.getFollowing(context.userId, limit);
};
