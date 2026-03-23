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
        ingredients: {
          create: recipeCreateInput.ingredients.map((i) => ({
            localId: i.localId,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: i.isOptional ?? false,
            note: i.note ?? null,
          })),
        },
        preparationSteps: {
          create: recipeCreateInput.preparationSteps.map((s, index) => ({
            description: s.description,
            order: s.order || index + 1,
          })),
        },
      },
      include: {
        ingredients: true,
        preparationSteps: true,
        author: true,
      },
    });

    return newRecipe;
  } catch (error) {
    console.error('Failed to create recipe:', error);
    throw error;
  }
};
