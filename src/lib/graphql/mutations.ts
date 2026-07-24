import { gql, type TypedDocumentNode } from '@apollo/client';
import type {
  MutationResponse,
  MutationResponseWithMessageKey,
  MutationResponseWithStatusCode,
} from '@/types/graphql/responses';

export interface UpdateUserMutationData {
  updateUser: MutationResponse & {
    user?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface UpdateUserMutationVariables {
  userUpdateInput: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateUserMutationData {
  createUser: MutationResponseWithMessageKey & {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      userName: string;
    };
  };
}

export interface CreateUserMutationVariables {
  userRegisterInput: Record<string, unknown>;
}

export interface ResetPasswordMutationData {
  resetPassword: MutationResponse;
}

export interface ResetPasswordMutationVariables {
  email: string;
}

export interface SetNewPasswordMutationData {
  setNewPassword: MutationResponse;
}

export interface SetNewPasswordMutationVariables {
  token: string;
  newPassword: string;
}

export interface ChangePasswordMutationData {
  changePassword: MutationResponse;
}

export interface ChangePasswordMutationVariables {
  passwordEditInput: Record<string, unknown>;
}

export interface CreateRecipeMutationData {
  createRecipe: {
    id: string;
    title: string;
  };
}

export interface CreateRecipeMutationVariables {
  recipeCreateInput: Record<string, unknown>;
}

export interface EditRecipeMutationData {
  editRecipe: {
    id: string;
    title: string;
  };
}

export interface EditRecipeMutationVariables {
  id: string;
  recipeEditInput: Record<string, unknown>;
}

export interface RateRecipeMutationData {
  rateRecipe: {
    id: string;
    averageRating: number;
    ratingsCount: number;
    userRating: number;
  };
}

export interface RateRecipeMutationVariables {
  ratingInput: Record<string, unknown>;
}

export interface DeleteRatingMutationData {
  deleteRating: boolean;
}

export interface DeleteRatingMutationVariables {
  recipeId: string;
}

export interface AddToFavoriteMutationData {
  addToFavoriteRecipes: MutationResponseWithStatusCode;
}

export interface RemoveFromFavoriteMutationData {
  removeFromFavoriteRecipes: MutationResponseWithStatusCode;
}

export interface FavoriteMutationVariables {
  userId: string;
  recipeId: string;
}

export interface FollowUserMutationData {
  followUser: MutationResponseWithStatusCode;
}

export interface UnfollowUserMutationData {
  unfollowUser: MutationResponseWithStatusCode;
}

export interface FollowMutationVariables {
  targetUserId: string;
}

/**
 * Mutation to create a new user account
 */
export const CREATE_USER: TypedDocumentNode<
  CreateUserMutationData,
  CreateUserMutationVariables
> = gql`
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

export const RESET_PASSWORD: TypedDocumentNode<
  ResetPasswordMutationData,
  ResetPasswordMutationVariables
> = gql`
  mutation resetPassword($email: String!) {
    resetPassword(email: $email) {
      success
      message
    }
  }
`;

export const SET_NEW_PASSWORD: TypedDocumentNode<
  SetNewPasswordMutationData,
  SetNewPasswordMutationVariables
> = gql`
  mutation setNewPassword($token: String!, $newPassword: String!) {
    setNewPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const CHANGE_PASSWORD: TypedDocumentNode<
  ChangePasswordMutationData,
  ChangePasswordMutationVariables
> = gql`
  mutation changePassword($passwordEditInput: PasswordEditInput!) {
    changePassword(passwordEditInput: $passwordEditInput) {
      success
      message
    }
  }
`;

export const UPDATE_USER: TypedDocumentNode<
  UpdateUserMutationData,
  UpdateUserMutationVariables
> = gql`
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

export const CREATE_RECIPE: TypedDocumentNode<
  CreateRecipeMutationData,
  CreateRecipeMutationVariables
> = gql`
  mutation CreateRecipe($recipeCreateInput: RecipeCreateInput!) {
    createRecipe(recipeCreateInput: $recipeCreateInput) {
      id
      title
    }
  }
`;

export const EDIT_RECIPE: TypedDocumentNode<
  EditRecipeMutationData,
  EditRecipeMutationVariables
> = gql`
  mutation EditRecipe($id: ID!, $recipeEditInput: RecipeEditInput!) {
    editRecipe(id: $id, recipeEditInput: $recipeEditInput) {
      id
      title
    }
  }
`;

export const RATE_RECIPE: TypedDocumentNode<
  RateRecipeMutationData,
  RateRecipeMutationVariables
> = gql`
  mutation RateRecipe($ratingInput: RatingInput!) {
    rateRecipe(ratingInput: $ratingInput) {
      id
      averageRating
      ratingsCount
      userRating
    }
  }
`;

export const DELETE_RATING: TypedDocumentNode<
  DeleteRatingMutationData,
  DeleteRatingMutationVariables
> = gql`
  mutation DeleteRating($recipeId: ID!) {
    deleteRating(recipeId: $recipeId)
  }
`;

export const ADD_TO_FAVORITE_RECIPES: TypedDocumentNode<
  AddToFavoriteMutationData,
  FavoriteMutationVariables
> = gql`
  mutation AddToFavoriteRecipes($userId: ID!, $recipeId: ID!) {
    addToFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const REMOVE_FROM_FAVORITE_RECIPES: TypedDocumentNode<
  RemoveFromFavoriteMutationData,
  FavoriteMutationVariables
> = gql`
  mutation RemoveFromFavoriteRecipes($userId: ID!, $recipeId: ID!) {
    removeFromFavoriteRecipes(userId: $userId, recipeId: $recipeId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const FOLLOW_USER: TypedDocumentNode<
  FollowUserMutationData,
  FollowMutationVariables
> = gql`
  mutation FollowUser($targetUserId: ID!) {
    followUser(targetUserId: $targetUserId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;

export const UNFOLLOW_USER: TypedDocumentNode<
  UnfollowUserMutationData,
  FollowMutationVariables
> = gql`
  mutation UnfollowUser($targetUserId: ID!) {
    unfollowUser(targetUserId: $targetUserId) {
      success
      message
      messageKey
      statusCode
    }
  }
`;
