import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { setNewPasswordValidationSchema } from '@/lib/validation/validation';
import type { SetNewPasswordInput } from './types';

export const setNewPassword = async (
  _: unknown,
  { token, newPassword }: SetNewPasswordInput,
) => {
  // Validate password
  const validation = setNewPasswordValidationSchema.safeParse({
    newPassword,
    confirmPassword: newPassword, // The schema requires it, but here we only have newPassword.
    // I should probably have a single password schema for this.
  });

  // Since the user might be using the same schema for UI, I'll match it or just check the password part.
  // Actually, let's just use the logic from the schema manually if needed, or pass it correctly.
  if (!validation.success) {
    return throwCustomError(
      'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
      ErrorTypes.VALIDATION_ERROR,
      {
        zodIssues: validation.error.issues,
      },
    );
  }

  try {
    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return throwCustomError(
        'Invalid or expired reset token. Please request a new password reset.',
        ErrorTypes.BAD_REQUEST,
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    console.log(`Password successfully reset for user: ${user.email}`);

    return {
      success: true,
      message:
        'Password successfully reset. You can now login with your new password.',
    };
  } catch (error) {
    console.error('Error in setNewPassword:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return throwCustomError(
      'An error occurred during password reset',
      ErrorTypes.INTERNAL_SERVER_ERROR,
    );
  }
};
