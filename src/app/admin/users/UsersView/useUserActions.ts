import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import type {
  AdminUserActionResult,
  InsightUserDetail,
  InsightUserRole,
} from '@/types/adminInsights';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';
import { changeUserRoleAction, deleteUserAction } from '../actions';

/**
 * Runs the admin user Server Actions inside a transition and reports the
 * outcome with localized notifications. The list refreshes itself, because the
 * actions revalidate the page on success.
 */
export const useUserActions = (onDeleted: () => void) => {
  const t = useTranslations('adminConsole');
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<InsightUserDetail | null>(
    null,
  );

  const reportFailure = (result: AdminUserActionResult) => {
    if (!result.ok) {
      showErrorNotification(
        t('users.notifications.errorTitle'),
        t(`users.errors.${result.error}`),
      );
    }
  };

  const changeRole = (user: InsightUserDetail, role: InsightUserRole) => {
    startTransition(async () => {
      const result = await changeUserRoleAction(user.id, role);

      if (result.ok) {
        showSuccessNotification(
          t('users.notifications.roleChangedTitle'),
          t('users.notifications.roleChangedMessage', {
            userName: user.userName,
            role: t(`roles.${role}`),
          }),
        );
      } else {
        reportFailure(result);
      }
    });
  };

  const confirmDelete = (user: InsightUserDetail) => {
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      setDeleteTarget(null);

      if (result.ok) {
        showSuccessNotification(
          t('users.notifications.deletedTitle'),
          t('users.notifications.deletedMessage', { userName: user.userName }),
        );
        onDeleted();
      } else {
        reportFailure(result);
      }
    });
  };

  return {
    isPending,
    deleteTarget,
    requestDelete: (user: InsightUserDetail) => setDeleteTarget(user),
    cancelDelete: () => setDeleteTarget(null),
    changeRole,
    confirmDelete,
  };
};
