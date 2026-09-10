import type { MutationCreateRecipeArgs } from '@/lib/graphql/generated/resolvers-types';
import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import { normalizeRecipeInput, resolveAuthenticatedUser } from '../utils';

export const createRecipe = async (
  _: unknown,
  { recipeCreateInput }: Partial<MutationCreateRecipeArgs>,
  context: GraphQLContext,
) => {
  if (!recipeCreateInput) {
    throw new Error('Recipe input is required');
  }
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.createRecipe(
    user.id,
    normalizeRecipeInput(recipeCreateInput),
  );
};
