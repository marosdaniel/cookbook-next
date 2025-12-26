import type { GraphQLContext } from '../../../../../types/graphql/context';

export const deleteUser = async (
  _: unknown,
  { id }: { id: string },
  context: GraphQLContext,
) => {
  const { userId: currentUserId, role: currentUserRole, prisma } = context;

  if (!currentUserId) {
    throw new Error('Unauthenticated operation - no user found');
  }

  if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
    throw new Error('Unauthorized operation - insufficient permissions');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Could not delete user');
  }
};
