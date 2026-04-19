import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { OperationResponse } from '@/types/graphql/responses';

export const followUser = async (
  _: unknown,
  { targetUserId }: { targetUserId: string },
  { userId: currentUserId }: GraphQLContext,
): Promise<OperationResponse> => {
  if (!currentUserId) {
    return {
      success: false,
      message: 'Authentication required',
      messageKey: 'response.userFollowUnauthorized',
      statusCode: 403,
    };
  }

  return await UserService.followUser(currentUserId, targetUserId);
};
