import type { UserListResult } from '@/types/adminInsights';

export type UsersViewProps = {
  result: UserListResult;
  /** Id of the signed in admin, whose own account cannot be changed here. */
  currentUserId: string;
};
