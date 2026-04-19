import type { RecipeFilterInput } from '@/lib/services/RecipeService';
import { RecipeService } from '@/lib/services/RecipeService';

export const getRecipes = async (
  _: unknown,
  { limit, filter }: { limit?: number; filter?: RecipeFilterInput },
) => {
  return await RecipeService.getRecipes(limit, filter);
};
