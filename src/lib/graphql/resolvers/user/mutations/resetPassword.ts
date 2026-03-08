import crypto from 'node:crypto';
import {
  generateResetToken,
  sendPasswordResetEmail,
} from '@/lib/email/nodemailer';
import { prisma } from '@/lib/prisma/prisma';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { resetPasswordValidationSchema } from '@/lib/validation/validation';
import type { ResetPasswordInput } from './types';

export const resetPassword = async (
  _: unknown,
  { email }: ResetPasswordInput,
) => {
  // Validate email
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

  try {
    const normalizedEmail = email.toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // For security, always return success even if user not found
    if (!user) {
      console.log(
        `Password reset requested for non-existent email: ${normalizedEmail}`,
      );
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Hash token for storage
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry time (1 hour from now)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with hashed token and expiry time
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send password reset email with original (unhashed) token
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Error sending reset email:', error);
      return throwCustomError(
        'Failed to send password reset email',
        ErrorTypes.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return throwCustomError(
      'An error occurred during password reset',
      ErrorTypes.INTERNAL_SERVER_ERROR,
    );
  }
};
