import type {
  QueryGetRecipeByIdArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { RecipeService } from '@/lib/services/RecipeService';

export const getRecipeById = async (
  _: unknown,
  { id }: RequireFields<QueryGetRecipeByIdArgs, 'id'>,
) => {
  return await RecipeService.getRecipeBySlugOrId(id);
};
