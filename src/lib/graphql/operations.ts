export const OPERATION_NAMES = {
  GET_RECIPES: 'getRecipes',
  GET_RECIPE_BY_ID: 'getRecipeById',
  GET_RECIPES_BY_TITLE: 'getRecipesByTitle',
  GET_RECIPES_BY_USER_NAME: 'getRecipesByUserName',
  GET_RECIPES_BY_USER_ID: 'getRecipesByUserId',
  GET_USER_BY_ID: 'getUserById',
  GET_USER_BY_USER_NAME: 'getUserByUserName',
  GET_ALL_USER: 'getAllUser',
  CREATE_USER: 'createUser',
  RESET_PASSWORD: 'resetPassword', // NOSONAR
  SET_NEW_PASSWORD: 'setNewPassword', // NOSONAR
  GET_METADATA_BY_TYPE: 'getMetadataByType',
  GET_ALL_METADATA: 'getAllMetadata',
  GET_RATINGS_BY_RECIPE: 'getRatingsByRecipe',
  CREATE_RECIPE: 'createRecipe',
  EDIT_RECIPE: 'editRecipe',
  DELETE_RECIPE: 'deleteRecipe',
  UPDATE_USER: 'updateUser',
  DELETE_USER: 'deleteUser',
  CHANGE_PASSWORD: 'changePassword', // NOSONAR
  ADD_TO_FAVORITE_RECIPES: 'addToFavoriteRecipes',
  REMOVE_FROM_FAVORITE_RECIPES: 'removeFromFavoriteRecipes',
  GET_FAVORITE_RECIPES: 'getFavoriteRecipes',
  GET_FOLLOWING: 'getFollowing',
  FOLLOW_USER: 'followUser',
  UNFOLLOW_USER: 'unfollowUser',
  GET_METADATA_BY_KEY: 'getMetadataByKey',
  RATE_RECIPE: 'rateRecipe',
  DELETE_RATING: 'deleteRating',
  DELETE_ALL_USER: 'deleteAllUser',
  CLEAN_USER_RECIPES: 'cleanUserRecipes',
  DELETE_ALL_RECIPES: 'deleteAllRecipes',
  CREATE_METADATA: 'createMetadata',
  DELETE_METADATA: 'deleteMetadata',
} as const;

export type GraphQLOperationName =
  (typeof OPERATION_NAMES)[keyof typeof OPERATION_NAMES];

export const KNOWN_OPERATION_NAMES = new Set<string>(
  Object.values(OPERATION_NAMES),
);

export const normalizeGraphQLOperationName = (
  operationName: string | null | undefined,
): string | undefined => {
  if (typeof operationName !== 'string') {
    return undefined;
  }

  const trimmed = operationName.trim();
  if (!trimmed) {
    return undefined;
  }

  const candidates = [
    trimmed,
    trimmed.toLowerCase(),
    `${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`,
  ];

  for (const candidate of candidates) {
    if (KNOWN_OPERATION_NAMES.has(candidate)) {
      return candidate;
    }
  }

  return `${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
};

export const isKnownGraphQLOperation = (
  operationName: string | undefined,
): operationName is GraphQLOperationName => {
  const normalizedOperationName = normalizeGraphQLOperationName(operationName);

  return (
    typeof normalizedOperationName === 'string' &&
    KNOWN_OPERATION_NAMES.has(normalizedOperationName)
  );
};
