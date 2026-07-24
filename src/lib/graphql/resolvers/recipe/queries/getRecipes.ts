import type { RecipeFilterInput } from '@/lib/services/RecipeService';
import { RecipeService } from '@/lib/services/RecipeService';

export const getRecipes = async (
  _: unknown,
  {
    limit,
    after,
    filter,
  }: { limit?: number; after?: string; filter?: RecipeFilterInput },
) => {
  return await RecipeService.getRecipes(limit, filter, after);
};
