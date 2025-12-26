// Shared server-side translation keys for FE localization mapping.
export const USER_FAVORITE_MESSAGE_KEYS = {
  UNAUTHORIZED: 'response.userFavoriteUnauthorized',
  INVALID_USER_ID: 'response.userFavoriteInvalidUserId',
  INVALID_RECIPE_ID: 'response.userFavoriteInvalidRecipeId',
  USER_NOT_FOUND: 'response.userFavoriteUserNotFound',
  RECIPE_NOT_FOUND: 'response.userFavoriteRecipeNotFound',
  ALREADY_FAVORITE: 'response.userFavoriteAlreadyFavorite',
  NOT_IN_FAVORITES: 'response.userFavoriteNotInFavorites',
  SUCCESS: 'response.userFavoriteSuccess',
} as const;

export const USER_REGISTER_MESSAGE_KEYS = {
  VALIDATION_ERROR: 'response.userRegisterValidationError',
  USERNAME_TAKEN: 'response.userRegisterUsernameTaken',
  EMAIL_TAKEN: 'response.userRegisterEmailTaken',
  SUCCESS: 'response.userRegisterSuccess',
} as const;
