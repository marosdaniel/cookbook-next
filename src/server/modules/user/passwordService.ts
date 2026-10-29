import crypto from 'node:crypto';
import { after } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  generateResetToken,
  sendPasswordResetEmail,
} from '@/lib/email/nodemailer';
import { checkPasswordResetEmailRateLimit } from '@/lib/rateLimit/rateLimit';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  passwordEditValidationSchema,
  resetPasswordValidationSchema,
  setNewPasswordValidationSchema,
} from '@/lib/validation/validation';
import { UserRepository } from './repository';
import type { PasswordEditDomainInput } from './types';

const UNIFORM_PASSWORD_RESET_RESPONSE = {
  success: true,
  message:
    'If an account with that email exists, a password reset link has been sent.',
} as const;

export const schedulePostResponseTask = (
  task: () => Promise<unknown>,
  errorMessage: string,
): void => {
  const executeSafely = async () => {
    try {
      await task();
    } catch (error) {
      console.error(errorMessage, error);
    }
  };

  try {
    after(executeSafely);
  } catch {
    void executeSafely();
  }
};

export const PasswordService = {
  async changePassword(
    userId: string,
    passwordEditInput: PasswordEditDomainInput,
  ) {
    const validation =
      passwordEditValidationSchema.safeParse(passwordEditInput);
    if (!validation.success) {
      return throwCustomError(
        'Invalid input data',
        ErrorTypes.VALIDATION_ERROR,
        {
          zodIssues: validation.error.issues,
        },
      );
    }

    const { currentPassword, newPassword } = passwordEditInput;

    const user = await UserRepository.findById(userId);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return throwCustomError(
        'Invalid current password',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.updatePasswordAndIncrementSession(
      userId,
      hashedPassword,
    );

    return true;
  },

  async resetPassword(email: string) {
    const validation = resetPasswordValidationSchema.safeParse({ email });
    if (!validation.success) {
      return throwCustomError(
        'Invalid email address',
        ErrorTypes.VALIDATION_ERROR,
        {
          zodIssues: validation.error.issues,
        },
      );
    }

    const normalizedEmail = email.toLowerCase();
    const emailRateLimit =
      await checkPasswordResetEmailRateLimit(normalizedEmail);
    if (!emailRateLimit.success) {
      return throwCustomError(
        'Too many password reset requests. Please try again later.',
        ErrorTypes.RATE_LIMITED,
      );
    }

    const user = await UserRepository.findByEmail(normalizedEmail);

    if (!user) {
      return { ...UNIFORM_PASSWORD_RESET_RESPONSE };
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await UserRepository.savePasswordResetToken(
      normalizedEmail,
      hashedToken,
      resetExpires,
    );

    schedulePostResponseTask(
      () => sendPasswordResetEmail(user.email, resetToken),
      'Error sending reset email:',
    );

    return { ...UNIFORM_PASSWORD_RESET_RESPONSE };
  },

  async setNewPassword(input: { token: string; newPassword: string }) {
    const { token, newPassword } = input;
    const validation = setNewPasswordValidationSchema.safeParse({
      newPassword,
      confirmPassword: newPassword,
    });

    if (!validation.success) {
      return throwCustomError(
        'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
        ErrorTypes.VALIDATION_ERROR,
        { zodIssues: validation.error.issues },
      );
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findValidResetTokenUser(hashedToken);

    if (!user) {
      return throwCustomError(
        'Invalid or expired reset token. Please request a new password reset.',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.updatePasswordAndIncrementSession(
      user.id,
      hashedPassword,
      true,
    );

    return {
      success: true,
      message:
        'Password successfully reset. You can now login with your new password.',
    };
  },
};
