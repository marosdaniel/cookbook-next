export interface ResetPasswordFormValues {
  email: string;
}

export interface ResetPasswordResponse {
  resetPassword: {
    success: boolean;
    message: string;
  };
}
