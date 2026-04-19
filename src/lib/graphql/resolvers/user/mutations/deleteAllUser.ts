import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const deleteAllUser = async (
  _: unknown,
  __: unknown,
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<number> => {
  if (!currentUserId || !currentUserRole) {
    return throwCustomError(
      'Unauthenticated operation - no user found',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  return await UserService.deleteAllUser(currentUserId, currentUserRole);
};
