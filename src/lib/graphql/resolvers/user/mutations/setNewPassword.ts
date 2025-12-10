import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

interface SetNewPasswordInput {
  token: string;
  newPassword: string;
}

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const setNewPassword = async (
  _: unknown,
  { token, newPassword }: SetNewPasswordInput,
) => {
  try {
    // Validate password strength
    const validationResult = passwordSchema.safeParse(newPassword);
    if (!validationResult.success) {
      throw new GraphQLError(
        'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
        {
          extensions: {
            code: 'WEAK_PASSWORD',
            http: { status: 400 },
            validationErrors: validationResult.error.errors,
          },
        },
      );
    }

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
      throw new GraphQLError(
        'Invalid or expired reset token. Please request a new password reset.',
        {
          extensions: {
            code: 'INVALID_RESET_TOKEN',
            http: { status: 400 },
          },
        },
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
