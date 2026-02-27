import {
  getAllMetadata,
  getMetadataByKey,
  getMetadataByType,
} from './resolvers/metadata/queries';
import { createRecipe, editRecipe } from './resolvers/recipe/mutations';
import { getRecipeById } from './resolvers/recipe/queries';
import {
  addToFavoriteRecipes,
  changePassword,
  cleanUserRecipes,
  createUser,
  deleteAllUser,
  deleteUser,
  loginUser,
  removeFromFavoriteRecipes,
  resetPassword,
  setNewPassword,
  updateUser,
} from './resolvers/user/mutations';
import { getUserById } from './resolvers/user/queries';

export const resolvers = {
  Query: {
    getUserById,
    getRecipeById,
    // Metadata queries
    getAllMetadata,
    getMetadataByType,
    getMetadataByKey,
  },
  Mutation: {
    addToFavoriteRecipes,
    changePassword,
    cleanUserRecipes,
    createUser,
    deleteAllUser,
    deleteUser,
    loginUser,
    removeFromFavoriteRecipes,
    resetPassword,
    setNewPassword,
    updateUser,
    createRecipe,
    editRecipe,
  },
  Recipe: {
    averageRating: async (parent: { id: string }) => {
      const agg = await import('@/lib/prisma/prisma').then((m) =>
        m.prisma.rating.aggregate({
          where: { recipeId: parent.id },
          _avg: { ratingValue: true },
        }),
      );
      return agg._avg?.ratingValue || 0;
    },
    ratingsCount: async (parent: { id: string }) => {
      const count = await import('@/lib/prisma/prisma').then((m) =>
        m.prisma.rating.count({ where: { recipeId: parent.id } }),
      );
      return count;
    },
    userRating: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.userId) return null;
      const userId = context.userId;
      const rating = await import('@/lib/prisma/prisma').then((m) =>
        m.prisma.rating.findUnique({
          where: {
            recipeId_userId: { recipeId: parent.id, userId },
          },
        }),
      );
      return rating?.ratingValue || null;
    },
    isFavorite: (
      parent: { favoritedByIds: string[] },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.userId) return false;
      return parent.favoritedByIds?.includes(context.userId) || false;
    },
  },
};
