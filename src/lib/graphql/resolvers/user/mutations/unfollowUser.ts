import { UserService } from '@/lib/services/UserService';
import { mapFollowResult } from '@/server/graphql/errorMapper';
import { domainForbidden, err } from '@/server/platform/errors';
import type { GraphQLContext } from '@/types/graphql/context';
import type { OperationResponse } from '@/types/graphql/responses';

export const unfollowUser = async (
  _: unknown,
  { targetUserId }: { targetUserId: string },
  { userId: currentUserId }: GraphQLContext,
): Promise<OperationResponse> => {
  if (!currentUserId) {
    return mapFollowResult(
      err(domainForbidden('UNAUTHORIZED', 'Authentication required')),
    );
  }

  const result = await UserService.unfollowUser(currentUserId, targetUserId);
  return mapFollowResult(result);
};
