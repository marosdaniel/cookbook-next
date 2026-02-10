import {
  getAllMetadata,
  getMetadataByKey,
  getMetadataByType,
} from './resolvers/metadata/queries';
import { createRecipe } from './resolvers/recipe/mutations';
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
  },
};
