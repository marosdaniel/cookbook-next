import type {
  MutationEditRecipeArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import { normalizeRecipeInput, resolveAuthenticatedUser } from '../utils';

export const editRecipe = async (
  _: unknown,
  { id, recipeEditInput }: RequireFields<MutationEditRecipeArgs, 'id'>,
  context: GraphQLContext,
) => {
  if (!recipeEditInput) {
    throw new Error('Recipe input is required');
  }
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.editRecipe(
    user.id,
    context.role,
    id,
    normalizeRecipeInput(recipeEditInput),
  );
};
