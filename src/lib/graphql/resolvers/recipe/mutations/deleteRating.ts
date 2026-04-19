import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAuthenticatedUser } from '../utils';

export const deleteRating = async (
  _: unknown,
  { recipeId }: { recipeId: string },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.deleteRating(user.id, recipeId);
};
