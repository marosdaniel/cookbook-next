import { gql } from '@apollo/client';

/**
 * Mutation to create a new user account
 */
export const CREATE_USER = gql`
  mutation createUser($userRegisterInput: UserRegisterInput!) {
    createUser(userRegisterInput: $userRegisterInput) {
      success
      message
      messageKey
      user {
        id
        email
        firstName
        lastName
        userName
      }
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) {
      success
      message
    }
  }
`;

export const SET_NEW_PASSWORD = gql`
  mutation setNewPassword($token: String!, $newPassword: String!) {
    setNewPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation changePassword($passwordEditInput: PasswordEditInput!) {
    changePassword(passwordEditInput: $passwordEditInput) {
      success
      message
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($userUpdateInput: UserUpdateInput!) {
    updateUser(userUpdateInput: $userUpdateInput) {
      success
      message
      user {
        id
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_RECIPE = gql`
  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {
    createRecipe(recipeCreateInput: $recipeCreateInput) {
      id
      title
    }
  }
`;

export const EDIT_RECIPE = gql`
  mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {
    editRecipe(id: $id, recipeEditInput: $recipeEditInput) {
      id
      title
    }
  }
`;

export const RATE_RECIPE = gql`
  mutation RateRecipe($ratingInput: RatingInput!) {
    rateRecipe(ratingInput: $ratingInput) {
      id
      averageRating
      ratingsCount
      userRating
    }
  }
`;

export const DELETE_RATING = gql`
  mutation DeleteRating($recipeId: ID!) {
    deleteRating(recipeId: $recipeId)
  }
`;

export const ADD_TO_FAVORITE_RECIPES = gql`
  mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {
    addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const REMOVE_FROM_FAVORITE_RECIPES = gql`
  mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {
    removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($targetUserId: ID!) {
    followUser(targetUserId: $targetUserId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($targetUserId: ID!) {
    unfollowUser(targetUserId: $targetUserId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;
