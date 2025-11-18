import {
  addToFavoriteRecipes,
  createUser,
  loginUser,
} from './resolvers/user/mutations';

export const resolvers = {
  Query: {},
  Mutation: {
    addToFavoriteRecipes,
    createUser,
    loginUser,
  },
};
