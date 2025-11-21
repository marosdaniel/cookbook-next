import { USER_FAVORITE_MESSAGE_KEYS } from '@/lib/graphql/messageKeys';
import type { IContext, OperationResponse } from '@/lib/graphql/types/common';

export const addToFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: { userId: string; recipeId: string },
  context: IContext,
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

  // Prisma handles ObjectId validation automatically

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

  const alreadyFavorite = user.favoriteRecipeIds?.includes(recipeId);
  if (alreadyFavorite)
    return {
      success: false,
      message: 'Recipe already in favorites',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.ALREADY_FAVORITE,
      statusCode: 400,
    };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        favoriteRecipeIds: { push: recipeId },
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data: {
        favoritedByIds: { push: userId },
      },
    }),
  ]);

  return {
    success: true,
    message: 'Recipe successfully added to favorites',
    messageKey: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
    statusCode: 200,
  };
};
