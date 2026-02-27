import { prisma } from '@/lib/prisma/prisma';
import type { GraphQLContext } from '@/types/graphql/context';

import type { RecipeCreateInput } from '../types';
import {
  buildRecipeData,
  resolveAuthenticatedUser,
  resolveRecipeMetadata,
  validateRequiredFields,
} from '../utils';

export const createRecipe = async (
  _: unknown,
  { recipeCreateInput }: { recipeCreateInput: RecipeCreateInput },
  context: GraphQLContext,
) => {
  validateRequiredFields(recipeCreateInput);

  try {
    const user = await resolveAuthenticatedUser(context);
    const metadata = await resolveRecipeMetadata(recipeCreateInput);
    const data = buildRecipeData(recipeCreateInput, metadata);

    const newRecipe = await prisma.recipe.create({
      data: {
        ...data,
        createdBy: user.id,
        ratings: { create: [] },
      },
    });

    return newRecipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
};
