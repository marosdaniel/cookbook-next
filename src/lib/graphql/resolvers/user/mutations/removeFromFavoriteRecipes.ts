import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { OperationResponse } from '@/types/graphql/responses';
import type { RemoveFromFavoriteRecipesInput } from './types';

export const removeFromFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: RemoveFromFavoriteRecipesInput,
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<OperationResponse> => {
  return await UserService.removeFromFavoriteRecipes(
    currentUserId as string,
    currentUserRole as string,
    userId,
    recipeId,
  );
};
