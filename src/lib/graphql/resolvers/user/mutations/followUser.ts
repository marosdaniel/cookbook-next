import { USER_FOLLOW_MESSAGE_KEYS } from '@/lib/graphql/MESSAGE_KEYS';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { OperationResponse } from '../../../../../types/graphql/responses';

export const followUser = async (
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

  if (currentUserId === targetUserId) {
    return {
      success: false,
      message: 'You cannot follow yourself',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.CANNOT_FOLLOW_SELF,
      statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    return {
      success: false,
      message: 'User not found',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.USER_NOT_FOUND,
      statusCode: ErrorTypes.NOT_FOUND.errorStatus,
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

  if (existingFollow) {
    return {
      success: false,
      message: 'Already following this user',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.ALREADY_FOLLOWING,
      statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
    };
  }

  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: targetUserId,
    },
  });

  return {
    success: true,
    message: 'Successfully followed user',
    messageKey: USER_FOLLOW_MESSAGE_KEYS.FOLLOW_SUCCESS,
    statusCode: 200,
  };
};
