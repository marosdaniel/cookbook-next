import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { RecipeEditInput } from '../types';
import { resolveAuthenticatedUser } from '../utils';

export const editRecipe = async (
  _: unknown,
  { id, recipeEditInput }: { id: string; recipeEditInput: RecipeEditInput },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.editRecipe(user.id, id, recipeEditInput);
};
