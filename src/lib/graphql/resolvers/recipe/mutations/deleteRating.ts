import { prisma } from '@/lib/prisma/prisma';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAuthenticatedUser } from '../utils';

export const deleteRating = async (
  _: unknown,
  { recipeId }: { recipeId: string },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);

  try {
    const deleted = await prisma.rating.delete({
      where: {
        recipeId_userId: {
          recipeId,
          userId: user.id,
        },
      },
    });

    return !!deleted;
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return false; // Record not found
    }
    console.error('Failed to delete rating:', error);
    throw error;
  }
};
