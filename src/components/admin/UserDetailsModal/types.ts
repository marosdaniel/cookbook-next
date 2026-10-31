import type { InsightUserDetail, InsightUserRole } from '@/types/adminInsights';

export type UserDetailsModalProps = {
  /** The user to show; the modal is closed while this is `null`. */
  user: InsightUserDetail | null;
  currentUserId: string;
  /** True while an admin action is running. */
  busy: boolean;
  onClose: () => void;
  onChangeRole: (user: InsightUserDetail, role: InsightUserRole) => void;
  onDelete: (user: InsightUserDetail) => void;
};
