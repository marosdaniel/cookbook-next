// import { Recipe, User } from '../../../../graphql/models';
// import { ErrorTypes, throwCustomError } from '../../../../helpers/error-handler.helper';

// // TODO: TO BE VERIFIED
// export const cleanUserRecipes = async (userId: string) => {
//   const user = await User.findById(userId);

//   if (!user) {
//     throwCustomError('User not found', ErrorTypes.USER_NOT_FOUND);
//   }

//   const validRecipes = [];
//   for (const recipeId of user.recipes) {
//     const recipeExists = await Recipe.exists({ _id: recipeId });
//     if (recipeExists) {
//       validRecipes.push(recipeId);
//     }
//   }

//   if (validRecipes.length !== user.recipes.length) {
//     user.recipes = validRecipes;
//     await user.save();
//   }

//   return true;
// };
