import { RecipeService } from '@/lib/services/RecipeService';

export const getRecipeById = async (_: unknown, { id }: { id: string }) => {
  return await RecipeService.getRecipeById(id);
};
