import bcrypt from 'bcrypt';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

interface ChangePasswordInput {
  passwordEditInput: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  };
}

export const changePassword = async (
  _: unknown,
  { passwordEditInput }: ChangePasswordInput,
) => {
  const { currentPassword, newPassword, confirmNewPassword } =
    passwordEditInput;

  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        message: 'Unauthorized',
      };
    }

    const userId = session.user.id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return {
        success: false,
        message: 'Please fill in all fields',
      };
    }

    if (newPassword !== confirmNewPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid current password',
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: 'An error occurred while changing the password',
    };
  }
};
