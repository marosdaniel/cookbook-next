import { UserRole } from '@prisma/client';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';

export const ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION = 'DELETE_ALL';

export const isAdminRole = (role: string | undefined): boolean =>
  role === UserRole.ADMIN;

export const assertAdminRole = (role: string | undefined): void => {
  if (!isAdminRole(role)) {
    throwCustomError(
      'Unauthorized operation - admin rights required',
      ErrorTypes.FORBIDDEN,
    );
  }
};

export const assertDestructiveConfirmation = (confirmation?: string): void => {
  if (confirmation !== ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION) {
    throwCustomError(
      'Destructive admin action requires explicit confirmation',
      ErrorTypes.BAD_REQUEST,
    );
  }
};
