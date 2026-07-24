/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation createUser($userRegisterInput: UserRegisterInput!) {\n    createUser(userRegisterInput: $userRegisterInput) {\n      success\n      message\n      messageKey\n      user {\n        id\n        email\n        firstName\n        lastName\n        userName\n      }\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation resetPassword($email: String!) {\n    resetPassword(email: $email) {\n      success\n      message\n    }\n  }\n": typeof types.ResetPasswordDocument,
    "\n  mutation setNewPassword($token: String!, $newPassword: String!) {\n    setNewPassword(token: $token, newPassword: $newPassword) {\n      success\n      message\n    }\n  }\n": typeof types.SetNewPasswordDocument,
    "\n  mutation changePassword($passwordEditInput: PasswordEditInput!) {\n    changePassword(passwordEditInput: $passwordEditInput)\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation updateUser($userUpdateInput: UserUpdateInput!) {\n    updateUser(userUpdateInput: $userUpdateInput) {\n      success\n      message\n      user {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {\n    createRecipe(recipeCreateInput: $recipeCreateInput) {\n      id\n      title\n    }\n  }\n": typeof types.CreateRecipeDocument,
    "\n  mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {\n    editRecipe(id: $id, recipeEditInput: $recipeEditInput) {\n      id\n      title\n    }\n  }\n": typeof types.EditRecipeDocument,
    "\n  mutation RateRecipe($ratingInput: RatingInput!) {\n    rateRecipe(ratingInput: $ratingInput) {\n      id\n      averageRating\n      ratingsCount\n      userRating\n    }\n  }\n": typeof types.RateRecipeDocument,
    "\n  mutation DeleteRating($recipeId: ID!) {\n    deleteRating(recipeId: $recipeId)\n  }\n": typeof types.DeleteRatingDocument,
    "\n  mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": typeof types.AddToFavoriteRecipesDocument,
    "\n  mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": typeof types.RemoveFromFavoriteRecipesDocument,
    "\n  mutation FollowUser($targetUserId: ID!) {\n    followUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": typeof types.FollowUserDocument,
    "\n  mutation UnfollowUser($targetUserId: ID!) {\n    unfollowUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": typeof types.UnfollowUserDocument,
    "\n  query getUserById($id: ID!) {\n    getUserById(id: $id) {\n      id\n      firstName\n      lastName\n      userName\n      email\n      role\n      locale\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetUserByIdDocument,
    "\n  query getAllMetadata {\n    getAllMetadata {\n      key\n      label\n      type\n      name\n    }\n  }\n": typeof types.GetAllMetadataDocument,
    "\n  query getMetadataByType($type: String!) {\n    getMetadataByType(type: $type) {\n      key\n      label\n      type\n      name\n    }\n  }\n": typeof types.GetMetadataByTypeDocument,
    "\n  query getRecipeById($id: ID!) {\n    getRecipeById(id: $id) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      youtubeLink\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      labels {\n        key\n        label\n      }\n      ingredients {\n        localId\n        name\n        quantity\n        unit\n        isOptional\n        note\n      }\n      preparationSteps {\n        description\n        order\n      }\n      averageRating\n      ratingsCount\n      userRating\n      isFavorite\n      prepTimeMinutes\n      cookTimeMinutes\n      restTimeMinutes\n      totalTimeMinutes\n      servingUnit {\n        key\n        label\n      }\n      cuisine {\n        key\n        label\n      }\n      dietaryFlags {\n        key\n        label\n      }\n      allergens {\n        key\n        label\n      }\n      equipment {\n        key\n        label\n      }\n      costLevel {\n        key\n        label\n      }\n      tips\n      substitutions\n      slug\n      seoTitle\n      seoDescription\n      socialImage\n    }\n  }\n": typeof types.GetRecipeByIdDocument,
    "\n  query getFavoriteRecipes($limit: Int) {\n    getFavoriteRecipes(limit: $limit) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      averageRating\n      ratingsCount\n      isFavorite\n      slug\n    }\n  }\n": typeof types.GetFavoriteRecipesDocument,
    "\n  query getRecipes($limit: Int, $after: String, $filter: RecipeFilterInput) {\n    getRecipes(limit: $limit, after: $after, filter: $filter) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetRecipesDocument,
    "\n  query getRecipesByUserId($userId: ID!, $limit: Int) {\n    getRecipesByUserId(userId: $userId, limit: $limit) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n    }\n  }\n": typeof types.GetRecipesByUserIdDocument,
    "\n  query getFollowing($limit: Int) {\n    getFollowing(limit: $limit) {\n      users {\n        id\n        firstName\n        lastName\n        userName\n        recipeCount\n        followedAt\n        latestRecipes {\n          id\n          title\n          description\n          imgSrc\n          cookingTime\n          servings\n          createdBy\n          category {\n            key\n            label\n          }\n          difficultyLevel {\n            key\n            label\n          }\n          averageRating\n          ratingsCount\n          isFavorite\n        }\n      }\n      totalFollowing\n    }\n  }\n": typeof types.GetFollowingDocument,
};
const documents: Documents = {
    "\n  mutation createUser($userRegisterInput: UserRegisterInput!) {\n    createUser(userRegisterInput: $userRegisterInput) {\n      success\n      message\n      messageKey\n      user {\n        id\n        email\n        firstName\n        lastName\n        userName\n      }\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation resetPassword($email: String!) {\n    resetPassword(email: $email) {\n      success\n      message\n    }\n  }\n": types.ResetPasswordDocument,
    "\n  mutation setNewPassword($token: String!, $newPassword: String!) {\n    setNewPassword(token: $token, newPassword: $newPassword) {\n      success\n      message\n    }\n  }\n": types.SetNewPasswordDocument,
    "\n  mutation changePassword($passwordEditInput: PasswordEditInput!) {\n    changePassword(passwordEditInput: $passwordEditInput)\n  }\n": types.ChangePasswordDocument,
    "\n  mutation updateUser($userUpdateInput: UserUpdateInput!) {\n    updateUser(userUpdateInput: $userUpdateInput) {\n      success\n      message\n      user {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {\n    createRecipe(recipeCreateInput: $recipeCreateInput) {\n      id\n      title\n    }\n  }\n": types.CreateRecipeDocument,
    "\n  mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {\n    editRecipe(id: $id, recipeEditInput: $recipeEditInput) {\n      id\n      title\n    }\n  }\n": types.EditRecipeDocument,
    "\n  mutation RateRecipe($ratingInput: RatingInput!) {\n    rateRecipe(ratingInput: $ratingInput) {\n      id\n      averageRating\n      ratingsCount\n      userRating\n    }\n  }\n": types.RateRecipeDocument,
    "\n  mutation DeleteRating($recipeId: ID!) {\n    deleteRating(recipeId: $recipeId)\n  }\n": types.DeleteRatingDocument,
    "\n  mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": types.AddToFavoriteRecipesDocument,
    "\n  mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": types.RemoveFromFavoriteRecipesDocument,
    "\n  mutation FollowUser($targetUserId: ID!) {\n    followUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": types.FollowUserDocument,
    "\n  mutation UnfollowUser($targetUserId: ID!) {\n    unfollowUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n": types.UnfollowUserDocument,
    "\n  query getUserById($id: ID!) {\n    getUserById(id: $id) {\n      id\n      firstName\n      lastName\n      userName\n      email\n      role\n      locale\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetUserByIdDocument,
    "\n  query getAllMetadata {\n    getAllMetadata {\n      key\n      label\n      type\n      name\n    }\n  }\n": types.GetAllMetadataDocument,
    "\n  query getMetadataByType($type: String!) {\n    getMetadataByType(type: $type) {\n      key\n      label\n      type\n      name\n    }\n  }\n": types.GetMetadataByTypeDocument,
    "\n  query getRecipeById($id: ID!) {\n    getRecipeById(id: $id) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      youtubeLink\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      labels {\n        key\n        label\n      }\n      ingredients {\n        localId\n        name\n        quantity\n        unit\n        isOptional\n        note\n      }\n      preparationSteps {\n        description\n        order\n      }\n      averageRating\n      ratingsCount\n      userRating\n      isFavorite\n      prepTimeMinutes\n      cookTimeMinutes\n      restTimeMinutes\n      totalTimeMinutes\n      servingUnit {\n        key\n        label\n      }\n      cuisine {\n        key\n        label\n      }\n      dietaryFlags {\n        key\n        label\n      }\n      allergens {\n        key\n        label\n      }\n      equipment {\n        key\n        label\n      }\n      costLevel {\n        key\n        label\n      }\n      tips\n      substitutions\n      slug\n      seoTitle\n      seoDescription\n      socialImage\n    }\n  }\n": types.GetRecipeByIdDocument,
    "\n  query getFavoriteRecipes($limit: Int) {\n    getFavoriteRecipes(limit: $limit) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      averageRating\n      ratingsCount\n      isFavorite\n      slug\n    }\n  }\n": types.GetFavoriteRecipesDocument,
    "\n  query getRecipes($limit: Int, $after: String, $filter: RecipeFilterInput) {\n    getRecipes(limit: $limit, after: $after, filter: $filter) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetRecipesDocument,
    "\n  query getRecipesByUserId($userId: ID!, $limit: Int) {\n    getRecipesByUserId(userId: $userId, limit: $limit) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n    }\n  }\n": types.GetRecipesByUserIdDocument,
    "\n  query getFollowing($limit: Int) {\n    getFollowing(limit: $limit) {\n      users {\n        id\n        firstName\n        lastName\n        userName\n        recipeCount\n        followedAt\n        latestRecipes {\n          id\n          title\n          description\n          imgSrc\n          cookingTime\n          servings\n          createdBy\n          category {\n            key\n            label\n          }\n          difficultyLevel {\n            key\n            label\n          }\n          averageRating\n          ratingsCount\n          isFavorite\n        }\n      }\n      totalFollowing\n    }\n  }\n": types.GetFollowingDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createUser($userRegisterInput: UserRegisterInput!) {\n    createUser(userRegisterInput: $userRegisterInput) {\n      success\n      message\n      messageKey\n      user {\n        id\n        email\n        firstName\n        lastName\n        userName\n      }\n    }\n  }\n"): typeof import('./graphql').CreateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation resetPassword($email: String!) {\n    resetPassword(email: $email) {\n      success\n      message\n    }\n  }\n"): typeof import('./graphql').ResetPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation setNewPassword($token: String!, $newPassword: String!) {\n    setNewPassword(token: $token, newPassword: $newPassword) {\n      success\n      message\n    }\n  }\n"): typeof import('./graphql').SetNewPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation changePassword($passwordEditInput: PasswordEditInput!) {\n    changePassword(passwordEditInput: $passwordEditInput)\n  }\n"): typeof import('./graphql').ChangePasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateUser($userUpdateInput: UserUpdateInput!) {\n    updateUser(userUpdateInput: $userUpdateInput) {\n      success\n      message\n      user {\n        id\n        firstName\n        lastName\n      }\n    }\n  }\n"): typeof import('./graphql').UpdateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {\n    createRecipe(recipeCreateInput: $recipeCreateInput) {\n      id\n      title\n    }\n  }\n"): typeof import('./graphql').CreateRecipeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {\n    editRecipe(id: $id, recipeEditInput: $recipeEditInput) {\n      id\n      title\n    }\n  }\n"): typeof import('./graphql').EditRecipeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RateRecipe($ratingInput: RatingInput!) {\n    rateRecipe(ratingInput: $ratingInput) {\n      id\n      averageRating\n      ratingsCount\n      userRating\n    }\n  }\n"): typeof import('./graphql').RateRecipeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteRating($recipeId: ID!) {\n    deleteRating(recipeId: $recipeId)\n  }\n"): typeof import('./graphql').DeleteRatingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n"): typeof import('./graphql').AddToFavoriteRecipesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {\n    removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n"): typeof import('./graphql').RemoveFromFavoriteRecipesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation FollowUser($targetUserId: ID!) {\n    followUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n"): typeof import('./graphql').FollowUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnfollowUser($targetUserId: ID!) {\n    unfollowUser(targetUserId: $targetUserId) {\n      success\n      message\n      messageKey\n      statusCode\n    }\n  }\n"): typeof import('./graphql').UnfollowUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getUserById($id: ID!) {\n    getUserById(id: $id) {\n      id\n      firstName\n      lastName\n      userName\n      email\n      role\n      locale\n      createdAt\n      updatedAt\n    }\n  }\n"): typeof import('./graphql').GetUserByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getAllMetadata {\n    getAllMetadata {\n      key\n      label\n      type\n      name\n    }\n  }\n"): typeof import('./graphql').GetAllMetadataDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getMetadataByType($type: String!) {\n    getMetadataByType(type: $type) {\n      key\n      label\n      type\n      name\n    }\n  }\n"): typeof import('./graphql').GetMetadataByTypeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getRecipeById($id: ID!) {\n    getRecipeById(id: $id) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      youtubeLink\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      labels {\n        key\n        label\n      }\n      ingredients {\n        localId\n        name\n        quantity\n        unit\n        isOptional\n        note\n      }\n      preparationSteps {\n        description\n        order\n      }\n      averageRating\n      ratingsCount\n      userRating\n      isFavorite\n      prepTimeMinutes\n      cookTimeMinutes\n      restTimeMinutes\n      totalTimeMinutes\n      servingUnit {\n        key\n        label\n      }\n      cuisine {\n        key\n        label\n      }\n      dietaryFlags {\n        key\n        label\n      }\n      allergens {\n        key\n        label\n      }\n      equipment {\n        key\n        label\n      }\n      costLevel {\n        key\n        label\n      }\n      tips\n      substitutions\n      slug\n      seoTitle\n      seoDescription\n      socialImage\n    }\n  }\n"): typeof import('./graphql').GetRecipeByIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getFavoriteRecipes($limit: Int) {\n    getFavoriteRecipes(limit: $limit) {\n      id\n      title\n      description\n      imgSrc\n      cookingTime\n      servings\n      createdBy\n      category {\n        key\n        label\n      }\n      difficultyLevel {\n        key\n        label\n      }\n      averageRating\n      ratingsCount\n      isFavorite\n      slug\n    }\n  }\n"): typeof import('./graphql').GetFavoriteRecipesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getRecipes($limit: Int, $after: String, $filter: RecipeFilterInput) {\n    getRecipes(limit: $limit, after: $after, filter: $filter) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): typeof import('./graphql').GetRecipesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getRecipesByUserId($userId: ID!, $limit: Int) {\n    getRecipesByUserId(userId: $userId, limit: $limit) {\n      recipes {\n        id\n        title\n        description\n        imgSrc\n        cookingTime\n        servings\n        createdBy\n        category {\n          key\n          label\n        }\n        difficultyLevel {\n          key\n          label\n        }\n        averageRating\n        ratingsCount\n        isFavorite\n        slug\n      }\n      totalRecipes\n    }\n  }\n"): typeof import('./graphql').GetRecipesByUserIdDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query getFollowing($limit: Int) {\n    getFollowing(limit: $limit) {\n      users {\n        id\n        firstName\n        lastName\n        userName\n        recipeCount\n        followedAt\n        latestRecipes {\n          id\n          title\n          description\n          imgSrc\n          cookingTime\n          servings\n          createdBy\n          category {\n            key\n            label\n          }\n          difficultyLevel {\n            key\n            label\n          }\n          averageRating\n          ratingsCount\n          isFavorite\n        }\n      }\n      totalFollowing\n    }\n  }\n"): typeof import('./graphql').GetFollowingDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
