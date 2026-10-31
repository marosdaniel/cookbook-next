import type {
  InsightUserDetail,
  InsightUserRole,
} from '@/types/adminInsights';

export type UserActionsMenuProps = {
  user: InsightUserDetail;
  /** Id of the signed in admin; actions on the own account are disabled. */
  currentUserId: string;
  /** Disables the trigger, for example while an action is running. */
  disabled?: boolean;
  /**
   * `icon` is the compact ActionIcon used in table rows, `button` a labelled
   * button used in the details modal.
   */
  variant?: 'icon' | 'button';
  onChangeRole: (user: InsightUserDetail, role: InsightUserRole) => void;
  onDelete: (user: InsightUserDetail) => void;
};

export type RoleMenuItemsProps = {
  user: InsightUserDetail;
  testIdPrefix: string;
  onChangeRole: (user: InsightUserDetail, role: InsightUserRole) => void;
};
