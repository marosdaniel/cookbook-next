export interface SetNewPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface SetNewPasswordResponse {
  setNewPassword: {
    success: boolean;
    message: string;
  };
}
