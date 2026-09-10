import type { Resolvers } from './generated/resolvers-types';
import {
  createRecipe,
  deleteRating,
  deleteRecipe,
  editRecipe,
  rateRecipe,
} from './resolvers/recipe/mutations';
import {
  getRecipeById,
  getRecipes,
  getRecipesByUserId,
} from './resolvers/recipe/queries';
import {
  addToFavoriteRecipes,
  changePassword,
  cleanUserRecipes,
  createUser,
  deleteAllRecipes,
  deleteAllUser,
  deleteUser,
  followUser,
  removeFromFavoriteRecipes,
  resetPassword,
  setNewPassword,
  unfollowUser,
  updateUser,
} from './resolvers/user/mutations';
import {
  getFavoriteRecipes,
  getFollowing,
  getUserById,
} from './resolvers/user/queries';

const getAllMetadata = async () => {
  return [];
};

const getMetadataByType = async (_parent: unknown, _args: { type: string }) => {
  return [];
};

export const resolvers: Resolvers = {
  Query: {
    getUserById,
    getRecipeById,
    getRecipes,
    getRecipesByUserId,
    getFavoriteRecipes,
    getFollowing,
    getAllMetadata,
    getMetadataByType,
  },
  Mutation: {
    addToFavoriteRecipes,
    changePassword,
    cleanUserRecipes,
    createUser,
    deleteAllRecipes,
    deleteAllUser,
    deleteUser,
    followUser,
    removeFromFavoriteRecipes,
    resetPassword,
    setNewPassword,
    unfollowUser,
    updateUser,
    createRecipe,
    editRecipe,
    deleteRecipe,
    rateRecipe,
    deleteRating,
  },
  Recipe: {
    author: async (
      parent: { createdBy: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      const author = await context.loaders.recipeAuthor.load(parent.createdBy);
      if (!author) {
        throw new Error('Recipe author not found');
      }
      return author;
    },
    averageRating: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      const data = await context.loaders.ratings.load(parent.id);
      return data.averageRating;
    },
    ratingsCount: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      const data = await context.loaders.ratings.load(parent.id);
      return data.ratingsCount;
    },
    userRating: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.loaders.userRating) return null;
      return context.loaders.userRating.load(parent.id);
    },
    isFavorite: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      if (!context.loaders.isFavorite) return false;
      return context.loaders.isFavorite.load(parent.id);
    },
  },
  User: {
    recipes: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      return context.loaders.userRecipes.load(parent.id);
    },
    favoriteRecipes: async (
      parent: { id: string },
      _: unknown,
      context: import('@/types/graphql/context').GraphQLContext,
    ) => {
      return context.loaders.userFavoriteRecipes.load(parent.id);
    },
  },
};
