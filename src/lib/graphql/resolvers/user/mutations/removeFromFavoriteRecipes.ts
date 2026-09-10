import type { MutationRemoveFromFavoriteRecipesArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { OperationResponse } from '@/types/graphql/responses';

export const removeFromFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: MutationRemoveFromFavoriteRecipesArgs,
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<OperationResponse> => {
  return await UserService.removeFromFavoriteRecipes(
    currentUserId as string,
    currentUserRole as string,
    userId,
    recipeId,
  );
};
