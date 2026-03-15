import { prisma } from '@/lib/prisma/prisma';

export const getRecipes = async (_: unknown, { limit }: { limit?: number }) => {
  const [recipes, totalRecipes] = await Promise.all([
    prisma.recipe.findMany({
      include: {
        ingredients: true,
        preparationSteps: true,
        author: true,
      },
      orderBy: { createdAt: 'desc' },
      ...(limit ? { take: limit } : {}),
    }),
    prisma.recipe.count(),
  ]);

  return {
    recipes,
    totalRecipes,
  };
};
