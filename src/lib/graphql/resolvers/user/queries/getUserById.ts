import type { GraphQLContext } from '../../../../../types/graphql/context';

export const getUserById = async (
  _: unknown,
  { id }: { id: string },
  context: GraphQLContext,
) => {
  const { prisma } = context;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
