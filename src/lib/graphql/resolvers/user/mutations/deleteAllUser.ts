import type { GraphQLContext } from '../../../../../types/graphql/context';

export const deleteAllUser = async (
  _: unknown,
  __: unknown,
  context: GraphQLContext,
) => {
  const { userId: currentUserId, role: currentUserRole, prisma } = context;

  if (!currentUserId || currentUserRole !== 'ADMIN') {
    throw new Error('Unauthorized operation - admin rights required');
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
    throw new Error('Could not delete all users');
  }
};
