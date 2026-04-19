import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getRecipesByUserId = async (
  _: unknown,
  { userId, limit }: { userId: string; limit?: number },
  _context: GraphQLContext,
) => {
  return await RecipeService.getRecipesByUserId(userId, limit);
};
