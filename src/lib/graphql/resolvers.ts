import { addToFavoriteRecipes } from './resolvers/user/mutations';

export const resolvers = {
	Query: {},
	Mutation: {
		addToFavoriteRecipes,
	},
};
