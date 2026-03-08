import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { nameValidationSchema } from '@/lib/validation/validation';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { UpdateUserInput } from './types';

export const updateUser = async (
  _: unknown,
  { userUpdateInput }: UpdateUserInput,
  { prisma, userId }: GraphQLContext,
) => {
  if (!userId) {
    throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }

  // Validate names if provided
  const { firstName, lastName, locale } = userUpdateInput;
  if (firstName || lastName) {
    nameValidationSchema.parse({
      firstName: firstName || 'placeholder',
      lastName: lastName || 'placeholder',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        locale: locale ?? user.locale,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    if (error && typeof error === 'object' && 'extensions' in error)
      throw error;

    return {
      success: false,
      message: 'An error occurred while updating the user',
    };
  }
};
