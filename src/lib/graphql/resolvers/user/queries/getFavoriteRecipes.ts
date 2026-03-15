import type { GraphQLContext } from '../../../../../types/graphql/context';

export const getFavoriteRecipes = async (
  _: unknown,
  { userId, limit }: { userId: string; limit?: number },
  context: GraphQLContext,
) => {
  const { prisma } = context;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favoriteRecipes: {
        include: {
          ingredients: true,
          preparationSteps: true,
        },
        orderBy: { createdAt: 'desc' },
        ...(limit ? { take: limit } : {}),
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user.favoriteRecipes;
};
