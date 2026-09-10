import type {
  MutationRateRecipeArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { RecipeService } from '@/lib/services/RecipeService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import type { GraphQLContext } from '@/types/graphql/context';
import { assertPresent, resolveAuthenticatedUser } from '../utils';

export const rateRecipe = async (
  _: unknown,
  { ratingInput }: RequireFields<MutationRateRecipeArgs, 'ratingInput'>,
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  const recipe = await RecipeService.rateRecipe(user.id, ratingInput);
  assertPresent(recipe, 'Recipe not found', ErrorTypes.NOT_FOUND);
  return recipe;
};
