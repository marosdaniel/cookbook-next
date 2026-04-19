import { UserService } from '@/lib/services/UserService';
import type { SetNewPasswordInput } from './types';

export const setNewPassword = async (
  _: unknown,
  input: SetNewPasswordInput,
) => {
  return await UserService.setNewPassword(input);
};
