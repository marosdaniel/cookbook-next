import type { GraphQLContext } from '../../../../../types/graphql/context';

const LATEST_RECIPES_LIMIT = 4;

export const getFollowing = async (
  _: unknown,
  { userId, limit }: { userId: string; limit?: number },
  { prisma }: GraphQLContext,
) => {
  const [follows, totalFollowing] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: {
            recipes: {
              orderBy: { createdAt: 'desc' },
              take: LATEST_RECIPES_LIMIT,
              include: {
                ingredients: true,
                preparationSteps: true,
              },
            },
            _count: {
              select: { recipes: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  const users = follows.map((follow) => ({
    id: follow.following.id,
    firstName: follow.following.firstName,
    lastName: follow.following.lastName,
    userName: follow.following.userName,
    recipeCount: follow.following._count.recipes,
    followedAt: follow.createdAt,
    latestRecipes: follow.following.recipes,
  }));

  return { users, totalFollowing };
};
