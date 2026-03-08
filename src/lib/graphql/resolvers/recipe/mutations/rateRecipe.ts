import { prisma } from '@/lib/prisma/prisma';
import type { GraphQLContext } from '@/types/graphql/context';
import type { RatingInput } from '../types';
import { resolveAuthenticatedUser } from '../utils';

export const rateRecipe = async (
  _: unknown,
  { ratingInput }: { ratingInput: RatingInput },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);

  try {
    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: ratingInput.recipeId },
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Create or update the rating
    await prisma.rating.upsert({
      where: {
        recipeId_userId: {
          recipeId: ratingInput.recipeId,
          userId: user.id,
        },
      },
      update: {
        ratingValue: ratingInput.ratingValue,
      },
      create: {
        recipeId: ratingInput.recipeId,
        userId: user.id,
        ratingValue: ratingInput.ratingValue,
      },
    });

    // Return the updated recipe
    return await prisma.recipe.findUnique({
      where: { id: ratingInput.recipeId },
      include: {
        ingredients: true,
        preparationSteps: true,
      },
    });
  } catch (error) {
    console.error('Failed to rate recipe:', error);
    throw error;
  }
};
