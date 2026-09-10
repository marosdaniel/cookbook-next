import type { MutationChangePasswordArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const changePassword = async (
  _: unknown,
  { passwordEditInput }: MutationChangePasswordArgs,
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
