import { USER_FOLLOW_MESSAGE_KEYS } from '@/lib/graphql/MESSAGE_KEYS';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { OperationResponse } from '../../../../../types/graphql/responses';

export const unfollowUser = async (
  _: unknown,
  { targetUserId }: { targetUserId: string },
  { userId: currentUserId, prisma }: GraphQLContext,
): Promise<OperationResponse> => {
  if (!currentUserId) {
    return {
      success: false,
      message: 'Authentication required',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.UNAUTHORIZED,
      statusCode: ErrorTypes.FORBIDDEN.errorStatus,
    };
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  if (!existingFollow) {
    return {
      success: false,
      message: 'You are not following this user',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.NOT_FOLLOWING,
      statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
    };
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    },
  });

  return {
    success: true,
    message: 'Successfully unfollowed user',
    messageKey: USER_FOLLOW_MESSAGE_KEYS.UNFOLLOW_SUCCESS,
    statusCode: 200,
  };
};
