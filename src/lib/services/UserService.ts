import crypto from 'node:crypto';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sanitizeOptional, sanitizeText } from '@/lib/sanitize/sanitize';
import { ZodError } from 'zod';
import {
  generateResetToken,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email/nodemailer';
import {
  USER_FAVORITE_MESSAGE_KEYS,
  USER_FOLLOW_MESSAGE_KEYS,
  USER_REGISTER_MESSAGE_KEYS,
} from '@/lib/graphql/MESSAGE_KEYS';
import type {
  ChangePasswordInput,
  SetNewPasswordInput,
  UpdateUserInput,
} from '@/lib/graphql/resolvers/user/mutations/types';
import { prisma } from '@/lib/prisma/prisma';
import { redis } from '@/lib/redis/redis';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { ZodIssueMinimal } from '@/lib/validation/types';
import {
  customValidationSchema,
  nameValidationSchema,
  passwordEditValidationSchema,
  resetPasswordValidationSchema,
  setNewPasswordValidationSchema,
} from '@/lib/validation/validation';
import type { CreateUserArgs } from '@/types/user';

const SALT_ROUNDS = 10;
const LATEST_RECIPES_LIMIT = 4;

export const UserService = {
  // Queries
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        recipes: {
          include: { ingredients: true, preparationSteps: true },
        },
        favoriteRecipes: {
          include: { ingredients: true, preparationSteps: true },
        },
      },
    });
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }
    return user;
  },

  async getFavoriteRecipes(userId: string, limit?: number) {
    const cacheKey = `user:${userId}:favorites:${limit || 'all'}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteRecipes: {
          include: { ingredients: true, preparationSteps: true },
          orderBy: { createdAt: 'desc' },
          ...(limit ? { take: limit } : {}),
        },
      },
    });
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, user.favoriteRecipes);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return user.favoriteRecipes;
  },

  async getFollowing(userId: string, limit?: number) {
    const cacheKey = `user:${userId}:following:${limit || 'all'}`;

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const [follows, totalFollowing] = await Promise.all([
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
        ...(limit ? { take: limit } : {}),
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);

    const users = follows.map((follow) => ({
      id: follow.following.id,
      firstName: follow.following.firstName,
      lastName: follow.following.lastName,
      userName: follow.following.userName,
      recipeCount: follow.following._count.recipes,
      followedAt: follow.createdAt,
      latestRecipes: follow.following.recipes,
    }));

    const result = { users, totalFollowing };

    if (redis) {
      try {
        await redis.setex(cacheKey, 60, result);
      } catch (error) {
        console.error('Redis cache set error:', error);
      }
    }

    return result;
  },

  // Mutations
  async createUser(userRegisterInput: CreateUserArgs['userRegisterInput']) {
    const {
      firstName: rawFirstName,
      lastName: rawLastName,
      userName: rawUserName,
      email,
      password,
      confirmPassword,
      locale,
    } = userRegisterInput;

    // Sanitize text fields before any processing or DB write
    const firstName = sanitizeText(rawFirstName);
    const lastName = sanitizeText(rawLastName);
    const userName = sanitizeText(rawUserName);

    try {
      customValidationSchema.parse({
        firstName,
        lastName,
        userName,
        email,
        password,
        confirmPassword,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const firstErrorMessage =
          error.issues[0]?.message || 'Validation failed';
        return throwCustomError(
          firstErrorMessage,
          ErrorTypes.VALIDATION_ERROR,
          {
            messageKey: USER_REGISTER_MESSAGE_KEYS.VALIDATION_ERROR,
            zodIssues: error.issues as ZodIssueMinimal[],
            originalError: error,
          },
        );
      }

      return throwCustomError('Invalid input data', ErrorTypes.BAD_REQUEST);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { userName: { equals: userName, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.userName.toLowerCase() === userName.toLowerCase()) {
        return throwCustomError(
          'This username is already taken',
          ErrorTypes.CONFLICT,
          {
            messageKey: USER_REGISTER_MESSAGE_KEYS.USERNAME_TAKEN,
          },
        );
      }

      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return throwCustomError(
          'This email address is already registered',
          ErrorTypes.CONFLICT,
          {
            messageKey: USER_REGISTER_MESSAGE_KEYS.EMAIL_TAKEN,
          },
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        userName,
        email: email.toLowerCase(),
        password: hashedPassword,
        locale: locale || 'en-gb',
        role: UserRole.USER,
      },
    });

    sendWelcomeEmail(newUser.email, newUser.firstName).catch((error) => {
      console.error('Error sending welcome email:', error);
    });

    return {
      success: true,
      message: 'User successfully created',
      messageKey: USER_REGISTER_MESSAGE_KEYS.SUCCESS,
      statusCode: 201,
      user: {
        ...newUser,
        recipes: [],
        favoriteRecipes: [],
      },
    };
  },

  async changePassword(
    userId: string,
    passwordEditInput: ChangePasswordInput['passwordEditInput'],
  ) {
    const validation =
      passwordEditValidationSchema.safeParse(passwordEditInput);
    if (!validation.success) {
      return throwCustomError(
        'Invalid input data',
        ErrorTypes.VALIDATION_ERROR,
        {
          zodIssues: validation.error.issues,
        },
      );
    }

    const { currentPassword, newPassword } = passwordEditInput;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return throwCustomError(
        'Invalid current password',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  },

  async resetPassword(email: string) {
    const validation = resetPasswordValidationSchema.safeParse({ email });
    if (!validation.success) {
      return throwCustomError(
        'Invalid email address',
        ErrorTypes.VALIDATION_ERROR,
        {
          zodIssues: validation.error.issues,
        },
      );
    }

    const normalizedEmail = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(
        `Password reset requested for non-existent email: ${normalizedEmail}`,
      );
      return {
        success: true,
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: resetExpires,
      },
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Error sending reset email:', error);
      return throwCustomError(
        'Failed to send password reset email',
        ErrorTypes.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  },

  async setNewPassword(input: SetNewPasswordInput) {
    const { token, newPassword } = input;
    const validation = setNewPasswordValidationSchema.safeParse({
      newPassword,
      confirmPassword: newPassword,
    });

    if (!validation.success) {
      return throwCustomError(
        'Password must be at least 8 characters long and include uppercase, lowercase letters and a number',
        ErrorTypes.VALIDATION_ERROR,
        { zodIssues: validation.error.issues },
      );
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return throwCustomError(
        'Invalid or expired reset token. Please request a new password reset.',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    console.log(`Password successfully reset for user: ${user.email}`);

    return {
      success: true,
      message:
        'Password successfully reset. You can now login with your new password.',
    };
  },

  async updateUser(
    userId: string,
    userUpdateInput: UpdateUserInput['userUpdateInput'],
  ) {
    const { firstName: rawFirstName, lastName: rawLastName, locale } = userUpdateInput;
    const firstName = rawFirstName ? sanitizeText(rawFirstName) : rawFirstName;
    const lastName = rawLastName ? sanitizeText(rawLastName) : rawLastName;
    if (firstName || lastName) {
      nameValidationSchema.parse({
        firstName: firstName || 'placeholder',
        lastName: lastName || 'placeholder',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        locale: locale ?? user.locale,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    };
  },

  async deleteUser(currentUserId: string, currentUserRole: string, id: string) {
    if (currentUserRole !== 'ADMIN' && currentUserId !== id) {
      return throwCustomError(
        'Unauthorized operation - insufficient permissions',
        ErrorTypes.FORBIDDEN,
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    await prisma.user.delete({ where: { id } });

    if (redis) {
      try {
        await Promise.all([
          redis.del(`user:${id}:favorites:all`),
          redis.del(`user:${id}:following:all`),
          redis.del(`recipes:user:${id}:all`),
        ]);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return true;
  },

  async deleteAllUser(currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== 'ADMIN') {
      return throwCustomError(
        'Unauthorized operation - admin rights required',
        ErrorTypes.FORBIDDEN,
      );
    }

    const result = await prisma.user.deleteMany({
      where: { id: { not: currentUserId } },
    });
    return result.count;
  },

  async addToFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ) {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized operation - insufficient permissions',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
        statusCode: ErrorTypes.FORBIDDEN.errorStatus,
      };
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.USER_NOT_FOUND,
        statusCode: ErrorTypes.NOT_FOUND.errorStatus,
      };
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return {
        success: false,
        message: 'Recipe not found',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.RECIPE_NOT_FOUND,
        statusCode: ErrorTypes.NOT_FOUND.errorStatus,
      };
    }

    const alreadyFavorite = await prisma.user.findFirst({
      where: { id: targetUserId, favoriteRecipes: { some: { id: recipeId } } },
    });

    if (alreadyFavorite) {
      return {
        success: false,
        message: 'Recipe already in favorites',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.ALREADY_FAVORITE,
        statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
      };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { favoriteRecipes: { connect: { id: recipeId } } },
    });

    if (redis) {
      try {
        await redis.del(`user:${targetUserId}:favorites:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return {
      success: true,
      message: 'Recipe successfully added to favorites',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
      statusCode: 200,
    };
  },

  async removeFromFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ) {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized operation - insufficient permissions',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
        statusCode: ErrorTypes.FORBIDDEN.errorStatus,
      };
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.USER_NOT_FOUND,
        statusCode: ErrorTypes.NOT_FOUND.errorStatus,
      };
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      return {
        success: false,
        message: 'Recipe not found',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.RECIPE_NOT_FOUND,
        statusCode: ErrorTypes.NOT_FOUND.errorStatus,
      };
    }

    const alreadyFavorite = await prisma.user.findFirst({
      where: { id: targetUserId, favoriteRecipes: { some: { id: recipeId } } },
    });

    if (!alreadyFavorite) {
      return {
        success: false,
        message: 'Recipe not in favorites',
        messageKey: USER_FAVORITE_MESSAGE_KEYS.NOT_IN_FAVORITES,
        statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
      };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { favoriteRecipes: { disconnect: { id: recipeId } } },
    });

    if (redis) {
      try {
        await redis.del(`user:${targetUserId}:favorites:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return {
      success: true,
      message: 'Recipe successfully removed from favorites',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
      statusCode: 200,
    };
  },

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      return {
        success: false,
        message: 'You cannot follow yourself',
        messageKey: USER_FOLLOW_MESSAGE_KEYS.CANNOT_FOLLOW_SELF,
        statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      return {
        success: false,
        message: 'User not found',
        messageKey: USER_FOLLOW_MESSAGE_KEYS.USER_NOT_FOUND,
        statusCode: ErrorTypes.NOT_FOUND.errorStatus,
      };
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      return {
        success: false,
        message: 'Already following this user',
        messageKey: USER_FOLLOW_MESSAGE_KEYS.ALREADY_FOLLOWING,
        statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
      };
    }

    await prisma.follow.create({
      data: { followerId: currentUserId, followingId: targetUserId },
    });

    if (redis) {
      try {
        await redis.del(`user:${currentUserId}:following:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return {
      success: true,
      message: 'Successfully followed user',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.FOLLOW_SUCCESS,
      statusCode: 200,
    };
  },

  async unfollowUser(currentUserId: string, targetUserId: string) {
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (!existingFollow) {
      return {
        success: false,
        message: 'You are not following this user',
        messageKey: USER_FOLLOW_MESSAGE_KEYS.NOT_FOLLOWING,
        statusCode: ErrorTypes.BAD_REQUEST.errorStatus,
      };
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (redis) {
      try {
        await redis.del(`user:${currentUserId}:following:all`);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return {
      success: true,
      message: 'Successfully unfollowed user',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.UNFOLLOW_SUCCESS,
      statusCode: 200,
    };
  },
};
