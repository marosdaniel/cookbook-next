import {
  addToFavoriteRecipes,
  createUser,
  loginUser,
  resetPassword,
  setNewPassword,
} from './resolvers/user/mutations';

export const resolvers = {
  Query: {},
  Mutation: {
    addToFavoriteRecipes,
    createUser,
    loginUser,
    resetPassword,
    setNewPassword,
  },
};
