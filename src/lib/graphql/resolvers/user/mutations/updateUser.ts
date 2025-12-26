import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface UpdateUserInput {
  userUpdateInput: {
    firstName?: string;
    lastName?: string;
    locale?: string;
  };
}

export const updateUser = async (
  _: unknown,
  { userUpdateInput }: UpdateUserInput,
) => {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    const userId = session.user.id;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: userUpdateInput.firstName || user.firstName,
        lastName: userUpdateInput.lastName || user.lastName,
        locale: userUpdateInput.locale || user.locale,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      message: 'An error occurred while updating the user',
    };
  }
};
