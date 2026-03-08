export interface ResetPasswordInput {
  email: string;
}

export interface ChangePasswordInput {
  passwordEditInput: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  };
}

export interface RemoveFromFavoriteRecipesInput {
  userId: string;
  recipeId: string;
}

export interface SetNewPasswordInput {
  token: string;
  newPassword: string;
}

export interface UpdateUserInput {
  userUpdateInput: {
    firstName?: string;
    lastName?: string;
    locale?: string;
  };
}
