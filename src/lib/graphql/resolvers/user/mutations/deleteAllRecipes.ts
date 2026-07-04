import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const deleteAllRecipes = async (
  _: unknown,
  { confirmation }: { confirmation?: string },
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<number> => {
  if (!currentUserId || !currentUserRole) {
    return throwCustomError(
      'Unauthenticated operation - no user found',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  return await UserService.deleteAllRecipes(
    currentUserId,
    currentUserRole,
    confirmation,
  );
};
