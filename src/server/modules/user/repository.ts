import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';
import { RECIPE_LIST_SELECT } from '@/server/modules/recipe/repository';
import { DEFAULT_QUERY_MAX_LIMIT } from '@/server/platform/pagination';

const LATEST_RECIPES_LIMIT = 4;

export const UserRepository = {
  findPublicById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByIdWithRecipeIdentifiers(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        recipes: {
          select: { id: true, slug: true },
        },
      },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findByUserNameOrEmailInsensitive(userName: string, email: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { userName: { equals: userName, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });
  },

  findWithFavoriteRecipes(userId: string, take?: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteRecipes: {
          select: RECIPE_LIST_SELECT,
          orderBy: { createdAt: 'desc' },
          take: take ?? DEFAULT_QUERY_MAX_LIMIT,
        },
      },
    });
  },

  async findFollowingAndCount(userId: string, take?: number) {
    return Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            include: {
              recipes: {
                select: RECIPE_LIST_SELECT,
                orderBy: { createdAt: 'desc' },
                take: LATEST_RECIPES_LIMIT,
              },
              _count: { select: { recipes: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: take ?? DEFAULT_QUERY_MAX_LIMIT,
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
  },

  createUser(data: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
    locale: string;
    role?: UserRole;
  }) {
    return prisma.user.create({
      data: {
        ...data,
        role: data.role ?? UserRole.USER,
      },
    });
  },

  updatePasswordAndIncrementSession(
    userId: string,
    hashedPassword: string,
    clearResetToken: boolean = false,
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        sessionVersion: { increment: 1 },
        ...(clearResetToken
          ? { resetPasswordToken: null, resetPasswordExpires: null }
          : {}),
      },
    });
  },

  savePasswordResetToken(email: string, hashedToken: string, expiresAt: Date) {
    return prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    });
  },

  findValidResetTokenUser(hashedToken: string) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });
  },

  updateProfile(
    userId: string,
    data: { firstName: string; lastName: string; locale: string },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  // The delete and its AuditLog entry must succeed or fail together, so both
  // always run inside a single interactive transaction.
  deleteAllUsersExcept(actorId: string) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.user.deleteMany({
        where: { id: { not: actorId } },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'USERS_DELETED_ALL',
          targetType: 'User',
          targetId: 'all',
          payload: { deletedCount: deleted.count },
        },
      });
      return deleted;
    });
  },

  deleteAllRecipesExceptAuthor(actorId: string) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.recipe.deleteMany({
        where: { createdBy: { not: actorId } },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'RECIPES_DELETED_ALL',
          targetType: 'Recipe',
          targetId: 'all',
          payload: { deletedCount: deleted.count },
        },
      });
      return deleted;
    });
  },

  findRecipeById(recipeId: string) {
    return prisma.recipe.findUnique({ where: { id: recipeId } });
  },

  async hasFavoriteRecipe(userId: string, recipeId: string) {
    const match = await prisma.user.findFirst({
      where: { id: userId, favoriteRecipes: { some: { id: recipeId } } },
    });
    return Boolean(match);
  },

  connectFavoriteRecipe(userId: string, recipeId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { favoriteRecipes: { connect: { id: recipeId } } },
    });
  },

  disconnectFavoriteRecipe(userId: string, recipeId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { favoriteRecipes: { disconnect: { id: recipeId } } },
    });
  },

  findFollow(followerId: string, followingId: string) {
    return prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  },

  createFollow(followerId: string, followingId: string) {
    return prisma.follow.create({
      data: { followerId, followingId },
    });
  },

  deleteFollow(followerId: string, followingId: string) {
    return prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  },
};
