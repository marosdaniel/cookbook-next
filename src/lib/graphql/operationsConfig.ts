/**
 * GraphQL operations access configuration
 *
 * Categories:
 * - publicOperations: Available to everyone (no token required)
 * - userOperations: For authenticated users (USER, BLOGGER, ADMIN)
 * - bloggerOperations: For BLOGGER and ADMIN roles
 * - adminOperations: Only for ADMIN role
 */

import {
  normalizeGraphQLOperationName,
  OPERATION_NAMES,
} from '@/lib/graphql/operations';
import type { UserRole } from '../../types/user';

interface OperationsConfig {
  publicOperations: string[];
  userOperations: string[];
  bloggerOperations: string[];
  adminOperations: string[];
}

export const operationsConfig: OperationsConfig = {
  // Public operations - no auth required
  publicOperations: [
    // Recipe queries
    OPERATION_NAMES.GET_RECIPES,
    OPERATION_NAMES.GET_RECIPE_BY_ID,
    OPERATION_NAMES.GET_RECIPES_BY_TITLE,
    OPERATION_NAMES.GET_RECIPES_BY_USER_NAME,
    OPERATION_NAMES.GET_RECIPES_BY_USER_ID,

    // User queries
    OPERATION_NAMES.GET_USER_BY_ID,
    OPERATION_NAMES.GET_USER_BY_USER_NAME,
    OPERATION_NAMES.GET_ALL_USER,

    // Auth mutations
    OPERATION_NAMES.CREATE_USER,
    OPERATION_NAMES.RESET_PASSWORD,
    OPERATION_NAMES.SET_NEW_PASSWORD,

    // Metadata
    OPERATION_NAMES.GET_METADATA_BY_TYPE,
    OPERATION_NAMES.GET_ALL_METADATA,

    // Ratings
    OPERATION_NAMES.GET_RATINGS_BY_RECIPE,
  ],

  // Authenticated user operations
  userOperations: [
    // Recipe operations
    OPERATION_NAMES.CREATE_RECIPE,
    OPERATION_NAMES.EDIT_RECIPE,
    OPERATION_NAMES.DELETE_RECIPE,

    // User mutations
    OPERATION_NAMES.UPDATE_USER,
    OPERATION_NAMES.DELETE_USER,
    OPERATION_NAMES.CHANGE_PASSWORD,

    // Favorite recipes
    OPERATION_NAMES.ADD_TO_FAVORITE_RECIPES,
    OPERATION_NAMES.REMOVE_FROM_FAVORITE_RECIPES,
    OPERATION_NAMES.GET_FAVORITE_RECIPES,

    // Following
    OPERATION_NAMES.GET_FOLLOWING,
    OPERATION_NAMES.FOLLOW_USER,
    OPERATION_NAMES.UNFOLLOW_USER,

    // Metadata
    OPERATION_NAMES.GET_METADATA_BY_KEY,

    // Ratings
    OPERATION_NAMES.RATE_RECIPE,
    OPERATION_NAMES.DELETE_RATING,
  ],

  // BLOGGER-specific operations can be added here when the role needs extra access.
  bloggerOperations: [],

  // Admin operations
  adminOperations: [
    // User management
    OPERATION_NAMES.DELETE_ALL_USER,
    OPERATION_NAMES.CLEAN_USER_RECIPES,

    // Content moderation
    OPERATION_NAMES.DELETE_ALL_RECIPES,

    // Metadata management
    OPERATION_NAMES.CREATE_METADATA,
    OPERATION_NAMES.DELETE_METADATA,
  ],
};

/**
 * Checks if an operation is public (no auth required)
 */
export const isPublicOperation = (operationName: string): boolean => {
  return operationsConfig.publicOperations.includes(operationName);
};

/**
 * Checks if a user can perform an operation based on their role
 */
export const canUserPerformOperation = (
  operationName: string,
  userRole?: UserRole,
): boolean => {
  const normalizedOperationName = normalizeGraphQLOperationName(operationName);

  if (!normalizedOperationName) {
    return false;
  }

  // Public operation - anyone can execute
  if (isPublicOperation(normalizedOperationName)) {
    return true;
  }

  // If no user role, only public operations allowed
  if (!userRole) {
    return false;
  }

  // Admin can do everything
  if (userRole === 'ADMIN') {
    return true;
  }

  // Blogger operations
  if (userRole === 'BLOGGER') {
    return (
      operationsConfig.userOperations.includes(normalizedOperationName) ||
      operationsConfig.bloggerOperations.includes(normalizedOperationName)
    );
  }

  // User operations
  if (userRole === 'USER') {
    return operationsConfig.userOperations.includes(normalizedOperationName);
  }

  return false;
};

/**
 * Returns which roles can access an operation
 */
export const getRequiredRolesForOperation = (
  operationName: string,
): UserRole[] | 'PUBLIC' => {
  const normalizedOperationName = normalizeGraphQLOperationName(operationName);

  if (!normalizedOperationName) {
    return ['ADMIN'];
  }

  if (isPublicOperation(normalizedOperationName)) {
    return 'PUBLIC';
  }

  if (operationsConfig.adminOperations.includes(normalizedOperationName)) {
    return ['ADMIN'];
  }

  if (operationsConfig.bloggerOperations.includes(normalizedOperationName)) {
    return ['ADMIN', 'BLOGGER'];
  }

  if (operationsConfig.userOperations.includes(normalizedOperationName)) {
    return ['ADMIN', 'BLOGGER', 'USER'];
  }

  // If not configured, it's protected (admin only)
  return ['ADMIN'];
};
