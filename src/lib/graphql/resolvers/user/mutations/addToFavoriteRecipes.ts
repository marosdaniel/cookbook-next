import { UserService } from '@/lib/services/UserService';
import type { GraphQLContext } from '@/types/graphql/context';
import type { OperationResponse } from '@/types/graphql/responses';

export const addToFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: { userId: string; recipeId: string },
  { userId: currentUserId, role: currentUserRole }: GraphQLContext,
): Promise<OperationResponse> => {
  return await UserService.addToFavoriteRecipes(
    currentUserId as string,
    currentUserRole as string,
    userId,
    recipeId,
  );
};
