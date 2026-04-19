import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';
import type { ChangePasswordInput } from './types';

export const changePassword = async (
  _: unknown,
  { passwordEditInput }: ChangePasswordInput,
  { userId }: GraphQLContext,
): Promise<boolean> => {
  if (!userId) {
    return throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }
  return await UserService.changePassword(userId, passwordEditInput);
};
