import type { InsightUserDetail } from '@/types/adminInsights';

export type DeleteUserModalProps = {
  /** The user to delete; the modal is closed while this is `null`. */
  user: InsightUserDetail | null;
  loading: boolean;
  onConfirm: (user: InsightUserDetail) => void;
  onCancel: () => void;
};
