import crypto from 'node:crypto';
import { after } from 'next/server';
import { ZodError } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { cacheKeys } from '@/lib/cache/cacheKeys';
import {
  generateResetToken,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '@/lib/email/nodemailer';
import { checkPasswordResetEmailRateLimit } from '@/lib/rateLimit/rateLimit';
import { redis } from '@/lib/redis/redis';
import { sanitizeText } from '@/lib/sanitize/sanitize';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  customValidationSchema,
  nameValidationSchema,
  passwordEditValidationSchema,
  resetPasswordValidationSchema,
  setNewPasswordValidationSchema,
} from '@/lib/validation/validation';
import type { RecipeDomainItem } from '@/server/modules/recipe/types';
import { UserRepository } from '@/server/modules/user/repository';
import {
  type FollowingDomainResult,
  type PasswordEditDomainInput,
  USER_REGISTER_DOMAIN_KEYS,
  type UserRegisterDomainInput,
  type UserUpdateDomainInput,
} from '@/server/modules/user/types';
import {
  type DomainError,
  type DomainSuccess,
  domainBadRequest,
  domainForbidden,
  domainNotFound,
  err,
  ok,
  type Result,
} from '@/server/platform/errors';
import { resolveQueryLimit } from '@/server/platform/pagination';

const ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION = 'DELETE_ALL';
const UNIFORM_PASSWORD_RESET_RESPONSE = {
  success: true,
  message:
    'If an account with that email exists, a password reset link has been sent.',
} as const;

const schedulePostResponseTask = (
  task: () => Promise<unknown>,
  errorMessage: string,
): void => {
  const executeSafely = async () => {
    try {
      await task();
    } catch (error) {
      console.error(errorMessage, error);
    }
  };

  try {
    after(executeSafely);
  } catch {
    void executeSafely();
  }
};

export const UserService = {
  // Queries
  async getUserById(id: string) {
    const user = await UserRepository.findPublicById(id);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }
    return user;
  },

  async getFavoriteRecipes(userId: string, limit?: number) {
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userFavorites(userId, normalizedLimit);

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached as RecipeDomainItem[];
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const user = await UserRepository.findWithFavoriteRecipes(
      userId,
      normalizedLimit,
    );
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
    const normalizedLimit = resolveQueryLimit(limit);
    const cacheKey = cacheKeys.userFollowing(userId, normalizedLimit);

    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) return cached as FollowingDomainResult;
      } catch (error) {
        console.error('Redis cache get error:', error);
      }
    }

    const [follows, totalFollowing] =
      await UserRepository.findFollowingAndCount(userId, normalizedLimit);

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
  async createUser(userRegisterInput: UserRegisterDomainInput) {
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
            messageKey: USER_REGISTER_DOMAIN_KEYS.VALIDATION_ERROR,
            zodIssues: error.issues,
            originalError: error,
          },
        );
      }

      return throwCustomError('Invalid input data', ErrorTypes.BAD_REQUEST);
    }

    const existingUser = await UserRepository.findByUserNameOrEmailInsensitive(
      userName,
      email,
    );

    if (existingUser) {
      if (existingUser.userName.toLowerCase() === userName.toLowerCase()) {
        return throwCustomError(
          'This username is already taken',
          ErrorTypes.CONFLICT,
          {
            messageKey: USER_REGISTER_DOMAIN_KEYS.USERNAME_TAKEN,
          },
        );
      }

      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return throwCustomError(
          'This email address is already registered',
          ErrorTypes.CONFLICT,
          {
            messageKey: USER_REGISTER_DOMAIN_KEYS.EMAIL_TAKEN,
          },
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await UserRepository.createUser({
      firstName,
      lastName,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      locale: locale || 'en-gb',
    });

    schedulePostResponseTask(
      () => sendWelcomeEmail(newUser.email, newUser.firstName),
      'Error sending welcome email:',
    );

    return {
      success: true,
      message: 'User successfully created',
      messageKey: USER_REGISTER_DOMAIN_KEYS.SUCCESS,
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
    passwordEditInput: PasswordEditDomainInput,
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

    const user = await UserRepository.findById(userId);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return throwCustomError(
        'Invalid current password',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.updatePasswordAndIncrementSession(
      userId,
      hashedPassword,
    );

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
    const emailRateLimit =
      await checkPasswordResetEmailRateLimit(normalizedEmail);
    if (!emailRateLimit.success) {
      return throwCustomError(
        'Too many password reset requests. Please try again later.',
        ErrorTypes.RATE_LIMITED,
      );
    }

    const user = await UserRepository.findByEmail(normalizedEmail);

    if (!user) {
      return { ...UNIFORM_PASSWORD_RESET_RESPONSE };
    }

    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await UserRepository.savePasswordResetToken(
      normalizedEmail,
      hashedToken,
      resetExpires,
    );

    schedulePostResponseTask(
      () => sendPasswordResetEmail(user.email, resetToken),
      'Error sending reset email:',
    );

    return { ...UNIFORM_PASSWORD_RESET_RESPONSE };
  },

  async setNewPassword(input: { token: string; newPassword: string }) {
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
    const user = await UserRepository.findValidResetTokenUser(hashedToken);

    if (!user) {
      return throwCustomError(
        'Invalid or expired reset token. Please request a new password reset.',
        ErrorTypes.BAD_REQUEST,
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await UserRepository.updatePasswordAndIncrementSession(
      user.id,
      hashedPassword,
      true,
    );

    return {
      success: true,
      message:
        'Password successfully reset. You can now login with your new password.',
    };
  },

  async updateUser(userId: string, userUpdateInput: UserUpdateDomainInput) {
    const {
      firstName: rawFirstName,
      lastName: rawLastName,
      locale,
    } = userUpdateInput;
    const firstName = rawFirstName ? sanitizeText(rawFirstName) : rawFirstName;
    const lastName = rawLastName ? sanitizeText(rawLastName) : rawLastName;
    if (firstName || lastName) {
      nameValidationSchema.parse({
        firstName: firstName || 'placeholder',
        lastName: lastName || 'placeholder',
      });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    const updatedUser = await UserRepository.updateProfile(userId, {
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      locale: locale ?? user.locale,
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

    const user = await UserRepository.findByIdWithRecipeIdentifiers(id);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }

    await UserRepository.deleteById(id);

    const currentRedis = redis;
    if (currentRedis) {
      try {
        const recipeKeysToInvalidate = (user.recipes ?? []).flatMap((r) => [
          cacheKeys.recipeDetail(r.id),
          cacheKeys.recipeLookup(r.id),
          ...(r.slug ? [cacheKeys.recipeLookup(r.slug)] : []),
        ]);

        await Promise.all([
          currentRedis.del(cacheKeys.userFavorites(id, undefined)),
          currentRedis.del(cacheKeys.userFollowing(id, undefined)),
          currentRedis.del(cacheKeys.userRecipes(id, undefined)),
          ...recipeKeysToInvalidate.map((key) => currentRedis.del(key)),
          ...(recipeKeysToInvalidate.length > 0 && currentRedis.incr
            ? [currentRedis.incr(cacheKeys.recipeListVersion)]
            : []),
        ]);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return true;
  },

  async deleteAllUser(
    currentUserId: string,
    currentUserRole: string,
    confirmation?: string,
  ) {
    if (currentUserRole !== 'ADMIN') {
      return throwCustomError(
        'Unauthorized operation - admin rights required',
        ErrorTypes.FORBIDDEN,
      );
    }

    if (confirmation !== ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION) {
      return throwCustomError(
        'Destructive admin action requires explicit confirmation',
        ErrorTypes.BAD_REQUEST,
      );
    }

    console.warn(
      `[audit] admin deleteAllUser invoked by ${currentUserId} at ${new Date().toISOString()}`,
    );

    const result = await UserRepository.deleteAllUsersExcept(currentUserId);

    if (redis?.incr) {
      try {
        await redis.incr(cacheKeys.recipeListVersion);
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return result.count;
  },

  async deleteAllRecipes(
    currentUserId: string,
    currentUserRole: string,
    confirmation?: string,
  ) {
    if (currentUserRole !== 'ADMIN') {
      return throwCustomError(
        'Unauthorized operation - admin rights required',
        ErrorTypes.FORBIDDEN,
      );
    }

    if (confirmation !== ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION) {
      return throwCustomError(
        'Destructive admin action requires explicit confirmation',
        ErrorTypes.BAD_REQUEST,
      );
    }

    console.warn(
      `[audit] admin deleteAllRecipes invoked by ${currentUserId} at ${new Date().toISOString()}`,
    );

    const result =
      await UserRepository.deleteAllRecipesExceptAuthor(currentUserId);
    return result.count;
  },

  async addToFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return err(
        domainForbidden(
          'UNAUTHORIZED',
          'Unauthorized operation - insufficient permissions',
        ),
      );
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const recipe = await UserRepository.findRecipeById(recipeId);
    if (!recipe) {
      return err(domainNotFound('RECIPE_NOT_FOUND', 'Recipe not found'));
    }

    const alreadyFavorite = await UserRepository.hasFavoriteRecipe(
      targetUserId,
      recipeId,
    );

    if (alreadyFavorite) {
      return err(
        domainBadRequest('ALREADY_FAVORITE', 'Recipe already in favorites'),
      );
    }

    await UserRepository.connectFavoriteRecipe(targetUserId, recipeId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFavorites(targetUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'SUCCESS',
      message: 'Recipe successfully added to favorites',
      statusCode: 200,
    });
  },

  async removeFromFavoriteRecipes(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
    recipeId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId !== targetUserId && currentUserRole !== 'ADMIN') {
      return err(
        domainForbidden(
          'UNAUTHORIZED',
          'Unauthorized operation - insufficient permissions',
        ),
      );
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const recipe = await UserRepository.findRecipeById(recipeId);
    if (!recipe) {
      return err(domainNotFound('RECIPE_NOT_FOUND', 'Recipe not found'));
    }

    const alreadyFavorite = await UserRepository.hasFavoriteRecipe(
      targetUserId,
      recipeId,
    );

    if (!alreadyFavorite) {
      return err(
        domainBadRequest('NOT_IN_FAVORITES', 'Recipe not in favorites'),
      );
    }

    await UserRepository.disconnectFavoriteRecipe(targetUserId, recipeId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFavorites(targetUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'SUCCESS',
      message: 'Recipe successfully removed from favorites',
      statusCode: 200,
    });
  },

  async followUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    if (currentUserId === targetUserId) {
      return err(
        domainBadRequest('CANNOT_FOLLOW_SELF', 'You cannot follow yourself'),
      );
    }

    const targetUser = await UserRepository.findById(targetUserId);
    if (!targetUser) {
      return err(domainNotFound('USER_NOT_FOUND', 'User not found'));
    }

    const existingFollow = await UserRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (existingFollow) {
      return err(
        domainBadRequest('ALREADY_FOLLOWING', 'Already following this user'),
      );
    }

    await UserRepository.createFollow(currentUserId, targetUserId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFollowing(currentUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'FOLLOW_SUCCESS',
      message: 'Successfully followed user',
      statusCode: 200,
    });
  },

  async unfollowUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Result<DomainSuccess, DomainError>> {
    const existingFollow = await UserRepository.findFollow(
      currentUserId,
      targetUserId,
    );

    if (!existingFollow) {
      return err(
        domainBadRequest('NOT_FOLLOWING', 'You are not following this user'),
      );
    }

    await UserRepository.deleteFollow(currentUserId, targetUserId);

    if (redis) {
      try {
        await redis.del(cacheKeys.userFollowing(currentUserId, undefined));
      } catch (error) {
        console.error('Redis cache invalidation error:', error);
      }
    }

    return ok({
      reason: 'UNFOLLOW_SUCCESS',
      message: 'Successfully unfollowed user',
      statusCode: 200,
    });
  },
};
