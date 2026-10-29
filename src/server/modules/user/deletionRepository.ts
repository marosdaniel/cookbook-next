import { prisma } from '@/lib/prisma/prisma';

// Upper bound for the identifiers collected for cache invalidation before a
// bulk delete. Anything beyond it simply expires through the cache TTLs.
export const DELETION_INVALIDATION_LIMIT = 5000;

export const DeletionRepository = {
  async findRecipeIdentifiersNotAuthoredBy(actorId: string) {
    return prisma.recipe.findMany({
      where: { createdBy: { not: actorId } },
      select: { id: true, slug: true, createdBy: true },
      take: DELETION_INVALIDATION_LIMIT,
    });
  },

  async findUserIdsExcept(actorId: string) {
    const users = await prisma.user.findMany({
      where: { id: { not: actorId } },
      select: { id: true },
      take: DELETION_INVALIDATION_LIMIT,
    });
    return users.map((user) => user.id);
  },

  // An admin deleting somebody else's account is always audited, in the same
  // transaction as the delete itself.
  async deleteByIdWithAudit(params: {
    actorId: string;
    targetId: string;
    deletedRecipeCount: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.user.delete({ where: { id: params.targetId } });
      await tx.auditLog.create({
        data: {
          actorId: params.actorId,
          action: 'USER_DELETED',
          targetType: 'User',
          targetId: params.targetId,
          payload: { deletedRecipeCount: params.deletedRecipeCount },
        },
      });
      return deleted;
    });
  },
};
