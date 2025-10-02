import { ObjectId } from 'mongodb';
import { getDb } from '../../../db';

interface OperationResult {
  success: boolean;
  message: string;
  statusCode?: number;
}

interface IContext {
  _id?: ObjectId | string;
  role?: 'ADMIN' | 'USER' | 'BLOGGER';
}

export const addToFavoriteRecipes = async (
  _: unknown,
  { userId, recipeId }: { userId: string; recipeId: string },
  context: IContext
): Promise<OperationResult> => {
  const currentUser = context;

  if (
    !currentUser ||
    (currentUser._id?.toString() !== userId && currentUser.role !== 'ADMIN')
  ) {
    return {
      success: false,
      message: 'Unauthorized operation - insufficient permissions',
      statusCode: 403,
    };
  }

  if (!ObjectId.isValid(userId)) {
    return {
      success: false,
      message: 'Invalid userId format',
      statusCode: 400,
    };
  }
  if (!ObjectId.isValid(recipeId)) {
    return {
      success: false,
      message: 'Invalid recipeId format',
      statusCode: 400,
    };
  }

  const db = await getDb();
  const usersCol = db.collection('users');
  const recipesCol = db.collection('recipes');

  const user = await usersCol.findOne({ _id: new ObjectId(userId) });
  if (!user)
    return { success: false, message: 'User not found', statusCode: 404 };
  const recipe = await recipesCol.findOne({ _id: new ObjectId(recipeId) });
  if (!recipe)
    return { success: false, message: 'Recipe not found', statusCode: 404 };

  const already = await usersCol.findOne({
    _id: new ObjectId(userId),
    favoriteRecipes: new ObjectId(recipeId),
  });
  if (already)
    return {
      success: false,
      message: 'Recipe already in favorites',
      statusCode: 400,
    };

  await usersCol.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { favoriteRecipes: new ObjectId(recipeId) } }
  );

  return {
    success: true,
    message: 'Recipe successfully added to favorites',
    statusCode: 200,
  };
};
