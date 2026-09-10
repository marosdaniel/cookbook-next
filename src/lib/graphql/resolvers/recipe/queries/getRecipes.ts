import type { QueryGetRecipesArgs } from '@/lib/graphql/generated/resolvers-types';
import type { RecipeFilterInput } from '@/lib/services/RecipeService';
import { RecipeService } from '@/lib/services/RecipeService';

export const getRecipes = async (
  _: unknown,
  { limit, after, filter }: Partial<QueryGetRecipesArgs>,
) => {
  return await RecipeService.getRecipes(
    limit ?? undefined,
    (filter ?? undefined) as RecipeFilterInput | undefined,
    after ?? undefined,
  );
};
