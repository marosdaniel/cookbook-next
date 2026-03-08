import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '../../../../../types/graphql/context';

export const deleteAllUser = async (
  _: unknown,
  __: unknown,
  { userId: currentUserId, role: currentUserRole, prisma }: GraphQLContext,
): Promise<number> => {
  if (!currentUserId || currentUserRole !== 'ADMIN') {
    return throwCustomError(
      'Unauthorized operation - admin rights required',
      ErrorTypes.FORBIDDEN,
    );
  }

  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error deleting all users:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return throwCustomError(
      'Could not delete all users',
      ErrorTypes.INTERNAL_SERVER_ERROR,
    );
  }
};
