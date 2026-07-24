import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';
import type { ChangePasswordInput } from './types';

export const changePassword = async (
  _: unknown,
  { passwordEditInput }: ChangePasswordInput,
  { userId }: GraphQLContext,
): Promise<{ success: boolean; message: string }> => {
  if (!userId) {
    return throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }

  const success = await UserService.changePassword(userId, passwordEditInput);

  return {
    success,
    message: success
      ? 'Password changed successfully'
      : 'Failed to change password',
  };
};
