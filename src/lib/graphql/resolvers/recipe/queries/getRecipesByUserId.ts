import type { GraphQLContext } from '@/types/graphql/context';

export const getRecipesByUserId = async (
  _: unknown,
  { userId, limit }: { userId: string; limit?: number },
  context: GraphQLContext,
) => {
  const { prisma } = context;

  const [recipes, totalRecipes] = await Promise.all([
    prisma.recipe.findMany({
      where: { createdBy: userId },
      include: {
        ingredients: true,
        preparationSteps: true,
        author: true,
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    }),
    prisma.recipe.count({ where: { createdBy: userId } }),
  ]);

  return {
    recipes,
    totalRecipes,
  };
};
