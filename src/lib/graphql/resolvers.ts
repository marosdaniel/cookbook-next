import {
  getAllMetadata,
  getMetadataByKey,
  getMetadataByType,
} from './resolvers/metadata/queries';
import {
  createRecipe,
  deleteRating,
  editRecipe,
  rateRecipe,
} from './resolvers/recipe/mutations';
import { getRecipeById, getRecipes } from './resolvers/recipe/queries';
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
import {
  getUserById,
  getFavoriteRecipes,
} from './resolvers/user/queries';

export const resolvers = {
  Query: {
    getUserById,
    getRecipeById,
    getRecipes,
    getFavoriteRecipes,
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
    rateRecipe,
    deleteRating,
  },
  Recipe: {
    averageRating: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      const agg = await context.prisma.rating.aggregate({
        where: { recipeId: parent.id },
        _avg: { ratingValue: true },
      });
      return agg._avg?.ratingValue || 0;
    },
    ratingsCount: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      return await context.prisma.rating.count({
        where: { recipeId: parent.id },
      });
    },
    userRating: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.userId) return null;
      const rating = await context.prisma.rating.findUnique({
        where: {
          recipeId_userId: { recipeId: parent.id, userId: context.userId },
        },
      });
      return rating?.ratingValue || null;
    },
    isFavorite: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.userId) return false;
      const count = await context.prisma.recipe.count({
        where: {
          id: parent.id,
          favoritedBy: { some: { id: context.userId } },
        },
      });
      return count > 0;
    },
  },
};
