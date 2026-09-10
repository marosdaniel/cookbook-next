import type { MutationResetPasswordArgs } from '@/lib/graphql/generated/resolvers-types';
import { UserService } from '@/lib/services/UserService';

export const resetPassword = async (
  _: unknown,
  { email }: MutationResetPasswordArgs,
) => {
  return await UserService.resetPassword(email);
};
