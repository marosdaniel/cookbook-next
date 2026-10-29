import { ZodError } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { sendWelcomeEmail } from '@/lib/email/nodemailer';
import { sanitizeText } from '@/lib/sanitize/sanitize';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import {
  customValidationSchema,
  nameValidationSchema,
} from '@/lib/validation/validation';
import {
  assertAdminRole,
  assertDestructiveConfirmation,
} from '@/server/modules/admin/policy';
import { invalidateCacheScope } from '@/server/platform/cache';
import { DeletionRepository } from './deletionRepository';
import { PasswordService, schedulePostResponseTask } from './passwordService';
import { UserRepository } from './repository';
import {
  USER_REGISTER_DOMAIN_KEYS,
  type UserRegisterDomainInput,
  type UserUpdateDomainInput,
} from './types';

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

    const recipes = user.recipes ?? [];

    if (currentUserId === id) {
      await UserRepository.deleteById(id);
    } else {
      // An admin removing somebody else's account is audited in the same
      // transaction as the delete.
      await DeletionRepository.deleteByIdWithAudit({
        actorId: currentUserId,
        targetId: id,
        deletedRecipeCount: recipes.length,
      });
    }

    await invalidateCacheScope({
      userIds: [id],
      recipeIds: recipes.map((recipe) => recipe.id),
      slugs: recipes.map((recipe) => recipe.slug),
      invalidateRecipeLists: recipes.length > 0,
    });

    return true;
  },

  async deleteAllUser(
    currentUserId: string,
    currentUserRole: string,
    confirmation?: string,
  ) {
    assertAdminRole(currentUserRole);
    assertDestructiveConfirmation(confirmation);

    // The affected identifiers must be collected before the delete, so the
    // matching cache entries and sessions can be invalidated afterwards.
    const [recipes, userIds] = await Promise.all([
      DeletionRepository.findRecipeIdentifiersNotAuthoredBy(currentUserId),
      DeletionRepository.findUserIdsExcept(currentUserId),
    ]);

    const result = await UserRepository.deleteAllUsersExcept(currentUserId);

    await invalidateCacheScope({
      userIds,
      recipeIds: recipes.map((recipe) => recipe.id),
      slugs: recipes.map((recipe) => recipe.slug),
      invalidateRecipeLists: true,
    });

    return result.count;
  },

  async deleteAllRecipes(
    currentUserId: string,
    currentUserRole: string,
    confirmation?: string,
  ) {
    assertAdminRole(currentUserRole);
    assertDestructiveConfirmation(confirmation);

    const recipes =
      await DeletionRepository.findRecipeIdentifiersNotAuthoredBy(
        currentUserId,
      );

    const result =
      await UserRepository.deleteAllRecipesExceptAuthor(currentUserId);

    await invalidateCacheScope({
      recipeIds: recipes.map((recipe) => recipe.id),
      slugs: recipes.map((recipe) => recipe.slug),
      authorIds: [...new Set(recipes.map((recipe) => recipe.createdBy))],
      invalidateRecipeLists: true,
    });

    return result.count;
  },
};
