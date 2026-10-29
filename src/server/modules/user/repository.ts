import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma/prisma';

const LATEST_RECIPES_LIMIT = 4;

export const UserRepository = {
  async findPublicById(id: string) {
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

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByIdWithRecipeIdentifiers(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        recipes: {
          select: { id: true, slug: true },
        },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findByUserNameOrEmailInsensitive(userName: string, email: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { userName: { equals: userName, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });
  },

  async findWithFavoriteRecipes(userId: string, take?: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteRecipes: {
          include: { ingredients: true, preparationSteps: true },
          orderBy: { createdAt: 'desc' },
          ...(take ? { take } : {}),
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
                orderBy: { createdAt: 'desc' },
                take: LATEST_RECIPES_LIMIT,
                include: { ingredients: true, preparationSteps: true },
              },
              _count: { select: { recipes: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        ...(take ? { take } : {}),
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
  },

  async createUser(data: {
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

  async updatePasswordAndIncrementSession(
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

  async savePasswordResetToken(
    email: string,
    hashedToken: string,
    expiresAt: Date,
  ) {
    return prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    });
  },

  async findValidResetTokenUser(hashedToken: string) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });
  },

  async updateProfile(
    userId: string,
    data: { firstName: string; lastName: string; locale: string },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  async deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async deleteAllUsersExcept(excludeUserId: string) {
    return prisma.user.deleteMany({
      where: { id: { not: excludeUserId } },
    });
  },

  async deleteAllRecipesExceptAuthor(excludeUserId: string) {
    return prisma.recipe.deleteMany({
      where: { createdBy: { not: excludeUserId } },
    });
  },

  async findRecipeById(recipeId: string) {
    return prisma.recipe.findUnique({ where: { id: recipeId } });
  },

  async hasFavoriteRecipe(userId: string, recipeId: string) {
    const match = await prisma.user.findFirst({
      where: { id: userId, favoriteRecipes: { some: { id: recipeId } } },
    });
    return Boolean(match);
  },

  async connectFavoriteRecipe(userId: string, recipeId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { favoriteRecipes: { connect: { id: recipeId } } },
    });
  },

  async disconnectFavoriteRecipe(userId: string, recipeId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { favoriteRecipes: { disconnect: { id: recipeId } } },
    });
  },

  async findFollow(followerId: string, followingId: string) {
    return prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  },

  async createFollow(followerId: string, followingId: string) {
    return prisma.follow.create({
      data: { followerId, followingId },
    });
  },

  async deleteFollow(followerId: string, followingId: string) {
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
