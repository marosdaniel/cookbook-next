import crypto from 'node:crypto';
import { GraphQLError } from 'graphql';
import {
  generateResetToken,
  sendPasswordResetEmail,
} from '@/lib/email/nodemailer';
import { prisma } from '@/lib/prisma';

interface ResetPasswordInput {
  email: string;
}

export const resetPassword = async (
  _: unknown,
  { email }: ResetPasswordInput,
) => {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // For security, always return success even if user not found
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
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
      where: { email: email.toLowerCase() },
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
      throw new GraphQLError('Failed to send password reset email', {
        extensions: {
          code: 'EMAIL_SEND_FAILED',
          http: { status: 500 },
        },
      });
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  } catch (error) {
    console.error('Error in resetPassword:', error);
    if (error instanceof GraphQLError) {
      throw error;
    }
    throw new GraphQLError('An error occurred during password reset', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
      },
    });
  }
};
