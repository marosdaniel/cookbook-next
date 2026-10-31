'use server';

import { revalidatePath } from 'next/cache';
import { getSessionSafely } from '@/lib/auth/safeSession';
import {
  type AdminActor,
  UserManagementService,
} from '@/server/modules/admin/userManagementService';
import { logger } from '@/server/platform/logger';
import type { AdminUserActionResult } from '@/types/adminInsights';
import { ADMIN_ROUTES } from '@/types/routes';

const MAX_ID_LENGTH = 64;

const resolveAdminActor = async (): Promise<AdminActor | null> => {
  const session = await getSessionSafely();
  const id = session?.user?.id;
  const role = session?.user?.role;

  return id && role === 'ADMIN' ? { id, role } : null;
};

const isValidId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  value.length <= MAX_ID_LENGTH;

// Every admin action goes through here: the session role is checked first, the
// input is validated, unexpected errors are logged and never reach the client,
// and a successful change refreshes the admin pages.
const runAdminUserAction = async (
  name: string,
  targetId: string,
  action: (
    actor: AdminActor,
    validTargetId: string,
  ) => Promise<AdminUserActionResult>,
): Promise<AdminUserActionResult> => {
  const actor = await resolveAdminActor();
  if (!actor) {
    return { ok: false, error: 'FORBIDDEN' };
  }

  if (!isValidId(targetId)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  try {
    const result = await action(actor, targetId);

    if (result.ok) {
      revalidatePath(ADMIN_ROUTES.USERS);
      revalidatePath(ADMIN_ROUTES.DASHBOARD);
    }

    return result;
  } catch (error) {
    logger.error(
      { err: error, action: name, targetId },
      'Admin user action failed',
    );

    return { ok: false, error: 'UNKNOWN' };
  }
};

export async function changeUserRoleAction(
  targetId: string,
  role: string,
): Promise<AdminUserActionResult> {
  return runAdminUserAction('changeUserRole', targetId, (actor, id) =>
    UserManagementService.changeRole(actor, id, role),
  );
}

export async function deleteUserAction(
  targetId: string,
): Promise<AdminUserActionResult> {
  return runAdminUserAction('deleteUser', targetId, (actor, id) =>
    UserManagementService.deleteUser(actor, id),
  );
}
