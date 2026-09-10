import type {
  MutationUpdateUserArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const updateUser = async (
  _: unknown,
  { userUpdateInput }: RequireFields<MutationUpdateUserArgs, 'userUpdateInput'>,
  { userId }: GraphQLContext,
) => {
  if (!userId) {
    return throwCustomError('Unauthorized', ErrorTypes.UNAUTHORIZED);
  }
  return await UserService.updateUser(userId, userUpdateInput);
};
