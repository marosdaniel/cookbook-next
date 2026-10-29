import { ZodError } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { cacheKeys } from '@/lib/cache/cacheKeys';
import { sendWelcomeEmail } from '@/lib/email/nodemailer';
import { redis } from '@/lib/redis/redis';
import { sanitizeText } from '@/lib/sanitize/sanitize';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  customValidationSchema,
  nameValidationSchema,
} from '@/lib/validation/validation';
import { PasswordService, schedulePostResponseTask } from './passwordService';
import { UserRepository } from './repository';
import {
  USER_REGISTER_DOMAIN_KEYS,
  type UserRegisterDomainInput,
  type UserUpdateDomainInput,
} from './types';

const ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION = 'DELETE_ALL';

export const AccountService = {
  ...PasswordService,

  async getUserById(id: string) {
    const user = await UserRepository.findPublicById(id);
    if (!user) {
      return throwCustomError('User not found', ErrorTypes.NOT_FOUND);
    }
    return user;
  },

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
};
