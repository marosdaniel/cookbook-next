import {
  GetAllMetadataDocument,
  GetFavoriteRecipesDocument,
  GetFollowingDocument,
  GetMetadataByTypeDocument,
  GetRecipeByIdDocument,
  GetRecipesByUserIdDocument,
  GetRecipesDocument,
  GetUserByIdDocument,
} from '@/lib/graphql/generated/graphql';

export const GET_USER_BY_ID = GetUserByIdDocument;
export const GET_ALL_METADATA = GetAllMetadataDocument;
export const GET_METADATA_BY_TYPE = GetMetadataByTypeDocument;
export const GET_RECIPE_BY_ID = GetRecipeByIdDocument;
export const GET_FAVORITE_RECIPES = GetFavoriteRecipesDocument;
export const GET_LATEST_RECIPES = GetRecipesDocument;
export const GET_RECIPES_BY_USER_ID = GetRecipesByUserIdDocument;
export const GET_FOLLOWING = GetFollowingDocument;
