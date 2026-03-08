import bcrypt from 'bcrypt';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { passwordEditValidationSchema } from '@/lib/validation/validation';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { ChangePasswordInput } from './types';

export const changePassword = async (
  _: unknown,
  { passwordEditInput }: ChangePasswordInput,
  { prisma, userId }: GraphQLContext,
): Promise<boolean> => {
  if (!userId) {
    return throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }

  // Validate input
  const validation = passwordEditValidationSchema.safeParse(passwordEditInput);
  if (!validation.success) {
    return throwCustomError('Invalid input data', ErrorTypes.VALIDATION_ERROR, {
      zodIssues: validation.error.issues,
    });
  }

  const { currentPassword, newPassword } = passwordEditInput;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return throwCustomError(
        'Invalid current password',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return throwCustomError(
      'An error occurred while changing the password',
      ErrorTypes.INTERNAL_SERVER_ERROR,
    );
  }
};
