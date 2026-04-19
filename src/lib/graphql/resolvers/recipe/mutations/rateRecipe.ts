import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { RatingInput } from '../types';
import { resolveAuthenticatedUser } from '../utils';

export const rateRecipe = async (
  _: unknown,
  { ratingInput }: { ratingInput: RatingInput },
  context: GraphQLContext,
) => {
  const user = await resolveAuthenticatedUser(context);
  return await RecipeService.rateRecipe(user.id, ratingInput);
};
