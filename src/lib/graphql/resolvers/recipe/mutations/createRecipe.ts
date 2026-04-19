import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { RecipeCreateInput } from '../types';
import { resolveAuthenticatedUser } from '../utils';

export const createRecipe = async (
  _: unknown,
  { recipeCreateInput }: { recipeCreateInput: RecipeCreateInput },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.createRecipe(user.id, recipeCreateInput);
};
