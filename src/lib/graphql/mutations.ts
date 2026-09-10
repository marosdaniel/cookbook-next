import {
  AddToFavoriteRecipesDocument,
  ChangePasswordDocument,
  CreateRecipeDocument,
  CreateUserDocument,
  DeleteRatingDocument,
  EditRecipeDocument,
  FollowUserDocument,
  RateRecipeDocument,
  RemoveFromFavoriteRecipesDocument,
  ResetPasswordDocument,
  SetNewPasswordDocument,
  UnfollowUserDocument,
  UpdateUserDocument,
} from '@/lib/graphql/generated/graphql';

export const CREATE_USER = CreateUserDocument;
export const RESET_PASSWORD = ResetPasswordDocument;
export const SET_NEW_PASSWORD = SetNewPasswordDocument;
export const CHANGE_PASSWORD = ChangePasswordDocument;
export const UPDATE_USER = UpdateUserDocument;
export const CREATE_RECIPE = CreateRecipeDocument;
export const EDIT_RECIPE = EditRecipeDocument;
export const RATE_RECIPE = RateRecipeDocument;
export const DELETE_RATING = DeleteRatingDocument;
export const ADD_TO_FAVORITE_RECIPES = AddToFavoriteRecipesDocument;
export const REMOVE_FROM_FAVORITE_RECIPES = RemoveFromFavoriteRecipesDocument;
export const FOLLOW_USER = FollowUserDocument;
export const UNFOLLOW_USER = UnfollowUserDocument;
