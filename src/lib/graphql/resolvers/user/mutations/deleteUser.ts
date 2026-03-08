import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '../../../../../types/graphql/context';

export const deleteUser = async (
  _: unknown,
  { id }: { id: string },
  { userId: currentUserId, role: currentUserRole, prisma }: GraphQLContext,
): Promise<boolean> => {
  if (!currentUserId) {
    return throwCustomError(
      'Unauthenticated operation - no user found',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
    return throwCustomError(
      'Unauthorized operation - insufficient permissions',
      ErrorTypes.FORBIDDEN,
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    await prisma.user.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return throwCustomError(
      'Could not delete user',
      ErrorTypes.INTERNAL_SERVER_ERROR,
    );
  }
};
