import type { MutationSetNewPasswordArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';

export const setNewPassword = async (
  _: unknown,
  input: MutationSetNewPasswordArgs,
) => {
  return await UserService.setNewPassword(input);
};
