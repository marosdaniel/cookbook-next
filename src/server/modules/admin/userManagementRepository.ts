import type { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';

export const UserManagementRepository = {
  findRoleById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
  },

  // The role change, the session invalidation (sessionVersion) and the audit
  // entry are written in one transaction, so none of them can happen alone.
  updateRoleWithAudit(params: {
    actorId: string;
    targetId: string;
    fromRole: UserRole;
    toRole: UserRole;
  }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: params.targetId },
        data: {
          role: params.toRole,
          sessionVersion: { increment: 1 },
        },
        select: { id: true, role: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: params.actorId,
          action: 'USER_ROLE_CHANGED',
          targetType: 'User',
          targetId: params.targetId,
          payload: { from: params.fromRole, to: params.toRole },
        },
      });

      return updated;
    });
  },
};
