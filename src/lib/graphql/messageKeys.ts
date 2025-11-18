// Shared server-side translation keys for FE localization mapping.
export const USER_FAVORITE_MESSAGE_KEYS = {
  UNAUTHORIZED: 'response.userFavoriteUnauthorized',
  INVALID_USER_ID: 'response.userFavoriteInvalidUserId',
  INVALID_RECIPE_ID: 'response.userFavoriteInvalidRecipeId',
  USER_NOT_FOUND: 'response.userFavoriteUserNotFound',
  RECIPE_NOT_FOUND: 'response.userFavoriteRecipeNotFound',
  ALREADY_FAVORITE: 'response.userFavoriteAlreadyFavorite',
  SUCCESS: 'response.userFavoriteSuccess',
} as const;

export type MessageKey =
  (typeof USER_FAVORITE_MESSAGE_KEYS)[keyof typeof USER_FAVORITE_MESSAGE_KEYS];
