import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

import type { RecipeEditInput } from '../types';
import {
  assertPresent,
  buildRecipeData,
  resolveAuthenticatedUser,
  resolveRecipeMetadata,
  validateRequiredFields,
} from '../utils';

export const editRecipe = async (
  _: unknown,
  { id, recipeEditInput }: { id: string; recipeEditInput: RecipeEditInput },
  context: GraphQLContext,
) => {
  validateRequiredFields(recipeEditInput);

  try {
    const user = await resolveAuthenticatedUser(context);

    // Check if recipe exists and belongs to the user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    assertPresent(existingRecipe, 'Recipe not found', ErrorTypes.NOT_FOUND);

    if (existingRecipe.createdBy !== user.id) {
      throwCustomError(
        'Not authorized to edit this recipe',
        ErrorTypes.FORBIDDEN,
      );
    }

    const metadata = await resolveRecipeMetadata(recipeEditInput);
    const data = buildRecipeData(recipeEditInput, metadata);

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data,
    });

    return updatedRecipe;
  } catch (error) {
    console.error('Failed to edit recipe:', error);
    throw error;
  }
};
