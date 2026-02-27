import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';

export const getRecipeById = async (_: unknown, { id }: { id: string }) => {
  try {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    return existingRecipe;
  } catch (error) {
    console.error('Failed to query recipe:', error);
    throw error;
  }
};
