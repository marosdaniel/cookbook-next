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

export const resolvers = {
  Query: {
    getUserById,
    getRecipeById,
    getRecipes,
    getRecipesByUserId,
    getFavoriteRecipes,
    getFollowing,
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
    followUser,
    removeFromFavoriteRecipes,
    resetPassword,
    setNewPassword,
    unfollowUser,
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
};
