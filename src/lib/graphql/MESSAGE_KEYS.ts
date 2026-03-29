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

export const USER_FOLLOW_MESSAGE_KEYS = {
  UNAUTHORIZED: 'response.userFollowUnauthorized',
  USER_NOT_FOUND: 'response.userFollowUserNotFound',
  ALREADY_FOLLOWING: 'response.userFollowAlreadyFollowing',
  NOT_FOLLOWING: 'response.userFollowNotFollowing',
  CANNOT_FOLLOW_SELF: 'response.userFollowCannotFollowSelf',
  FOLLOW_SUCCESS: 'response.userFollowSuccess',
  UNFOLLOW_SUCCESS: 'response.userUnfollowSuccess',
} as const;

export const USER_REGISTER_MESSAGE_KEYS = {
  VALIDATION_ERROR: 'response.userRegisterValidationError',
  USERNAME_TAKEN: 'response.userRegisterUsernameTaken',
  EMAIL_TAKEN: 'response.userRegisterEmailTaken',
  SUCCESS: 'response.userRegisterSuccess',
} as const;
