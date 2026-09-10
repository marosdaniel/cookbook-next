import type { QueryGetFavoriteRecipesArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getFavoriteRecipes = async (
  _: unknown,
  { limit }: Partial<QueryGetFavoriteRecipesArgs>,
  context: GraphQLContext,
) => {
  if (!context.userId) {
    throw new Error('Authentication required');
  }

  return await UserService.getFavoriteRecipes(
    context.userId,
    limit ?? undefined,
  );
};
