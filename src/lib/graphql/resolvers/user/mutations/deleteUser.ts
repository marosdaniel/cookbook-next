import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const deleteUser = async (
  _: unknown,
  { id }: { id: string },
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<boolean> => {
  if (!currentUserId || !currentUserRole) {
    return throwCustomError(
      'Unauthenticated operation - no user found',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  return await UserService.deleteUser(currentUserId, currentUserRole, id);
};
