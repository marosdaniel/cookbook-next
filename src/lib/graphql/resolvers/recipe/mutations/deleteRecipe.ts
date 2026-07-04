import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAuthenticatedUser } from '../utils';

export const deleteRecipe = async (
  _: unknown,
  { id }: { id: string },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.deleteRecipe(user.id, context.role, id);
};
