import type { GraphQLContext } from '../../../../../types/graphql/context';

export const getUserById = async (
  _: unknown,
  { id }: { id: string },
  context: GraphQLContext,
) => {
  const { prisma } = context;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      recipes: {
        include: {
          ingredients: true,
          preparationSteps: true,
        },
      },
      favoriteRecipes: {
        include: {
          ingredients: true,
          preparationSteps: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
