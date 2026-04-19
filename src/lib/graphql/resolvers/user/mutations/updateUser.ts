import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';
import type { UpdateUserInput } from './types';

export const updateUser = async (
  _: unknown,
  { userUpdateInput }: UpdateUserInput,
  { userId }: GraphQLContext,
) => {
  if (!userId) {
    return throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }
  return await UserService.updateUser(userId, userUpdateInput);
};
