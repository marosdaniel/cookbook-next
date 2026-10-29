import type { User as PrismaUser } from '@prisma/client';
import type { RecipeDomainItem } from '@/server/modules/recipe/types';

export interface UserRegisterDomainInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  locale?: string | null;
}

export interface UserUpdateDomainInput {
  firstName?: string | null;
  lastName?: string | null;
  locale?: string | null;
}

export interface PasswordEditDomainInput {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const USER_REGISTER_DOMAIN_KEYS = {
  VALIDATION_ERROR: 'response.userRegisterValidationError',
  USERNAME_TAKEN: 'response.userRegisterUsernameTaken',
  EMAIL_TAKEN: 'response.userRegisterEmailTaken',
  SUCCESS: 'response.userRegisterSuccess',
} as const;

export type UserDomainItem = Pick<
  PrismaUser,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'userName'
  | 'email'
  | 'role'
  | 'locale'
  | 'createdAt'
  | 'updatedAt'
> & {
  recipes?: RecipeDomainItem[] | null;
  favoriteRecipes?: RecipeDomainItem[] | null;
};

export interface FollowingDomainResult {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    recipeCount: number;
    followedAt: Date;
    latestRecipes: RecipeDomainItem[];
  }>;
  totalFollowing: number;
}
