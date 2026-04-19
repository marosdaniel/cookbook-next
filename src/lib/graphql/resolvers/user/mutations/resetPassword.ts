import { UserService } from '@/lib/services/UserService';
import type { ResetPasswordInput } from './types';

export const resetPassword = async (
  _: unknown,
  { email }: ResetPasswordInput,
) => {
  return await UserService.resetPassword(email);
};
