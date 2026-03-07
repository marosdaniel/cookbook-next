import { USER_FAVORITE_MESSAGE_KEYS } from '@/lib/graphql/MESSAGE_KEYS';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { OperationResponse } from '../../../../../types/graphql/responses';

export const removeFromFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: { userId: string; recipeId: string },
  context: GraphQLContext,
): Promise<OperationResponse> => {
  const { userId: currentUserId, role: currentUserRole, prisma } = context;

  if (
    !currentUserId ||
    (currentUserId !== userId && currentUserRole !== 'ADMIN')
  ) {
    return {
      success: false,
      message: 'Unauthorized operation - insufficient permissions',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
      statusCode: 403,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user)
    return {
      success: false,
      message: 'User not found',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.USER_NOT_FOUND,
      statusCode: 404,
    };

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
  });
  if (!recipe)
    return {
      success: false,
      message: 'Recipe not found',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.RECIPE_NOT_FOUND,
      statusCode: 404,
    };

  const alreadyFavorite = await prisma.user.findFirst({
    where: {
      id: userId,
      favoriteRecipes: { some: { id: recipeId } },
    },
  });

  if (!alreadyFavorite)
    return {
      success: false,
      message: 'Recipe not in favorites',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.NOT_IN_FAVORITES,
      statusCode: 400,
    };

  await prisma.user.update({
    where: { id: userId },
    data: {
      favoriteRecipes: {
        disconnect: { id: recipeId },
      },
    },
  });

  return {
    success: true,
    message: 'Recipe successfully removed from favorites',
    messageKey: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
    statusCode: 200,
  };
};
