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
  },
};
