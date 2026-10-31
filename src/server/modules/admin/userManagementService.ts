import { UserRole } from '@prisma/client';
import { AccountService } from '@/server/modules/user';
import { invalidateCacheScope } from '@/server/platform/cache';
import {
  type AdminUserActionError,
  type AdminUserActionResult,
  isInsightUserRole,
} from '@/types/adminInsights';
import { assertAdminRole } from './policy';
import { UserManagementRepository } from './userManagementRepository';

export type AdminActor = {
  id: string;
  role: string | undefined;
};

const fail = (error: AdminUserActionError): AdminUserActionResult => ({
  ok: false,
  error,
});

const SUCCESS: AdminUserActionResult = { ok: true };

export const UserManagementService = {
  /**
   * Changes the role of another user. An admin cannot change their own role,
   * which also guarantees that the last admin can never demote themselves.
   * The target's sessions are revoked, so the new role applies after a new
   * sign-in.
   */
  async changeRole(
    actor: AdminActor,
    targetId: string,
    newRole: string,
  ): Promise<AdminUserActionResult> {
    assertAdminRole(actor.role);

    if (!targetId || !isInsightUserRole(newRole)) {
      return fail('INVALID_INPUT');
    }

    if (actor.id === targetId) {
      return fail('SELF_ACTION');
    }

    const target = await UserManagementRepository.findRoleById(targetId);
    if (!target) {
      return fail('NOT_FOUND');
    }

    if (target.role === newRole) {
      return fail('UNCHANGED');
    }

    await UserManagementRepository.updateRoleWithAudit({
      actorId: actor.id,
      targetId,
      fromRole: target.role,
      toRole: newRole,
    });
    await invalidateCacheScope({ sessionUserId: targetId });

    return SUCCESS;
  },

  /** Deletes another user's account (audited by AccountService). */
  async deleteUser(
    actor: AdminActor,
    targetId: string,
  ): Promise<AdminUserActionResult> {
    assertAdminRole(actor.role);

    if (!targetId) {
      return fail('INVALID_INPUT');
    }

    if (actor.id === targetId) {
      return fail('SELF_ACTION');
    }

    const target = await UserManagementRepository.findRoleById(targetId);
    if (!target) {
      return fail('NOT_FOUND');
    }

    await AccountService.deleteUser(actor.id, UserRole.ADMIN, targetId);

    return SUCCESS;
  },
};
