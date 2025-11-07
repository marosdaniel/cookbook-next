/**
 * GraphQL operations access configuration
 *
 * Categories:
 * - publicOperations: Available to everyone (no token required)
 * - userOperations: For authenticated users (USER, BLOGGER, ADMIN)
 * - bloggerOperations: For BLOGGER and ADMIN roles
 * - adminOperations: Only for ADMIN role
 */

export type UserRole = 'ADMIN' | 'USER' | 'BLOGGER';

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
    'getRecipes',
    'getRecipeById',
    'getRecipesByTitle',
    'getRecipesByUserName',
    'getRecipesByUserId',

    // User queries
    'getUserById',
    'getUserByUserName',
    'getAllUser',

    // Auth mutations
    'createUser',
    'loginUser',
    'resetPassword',
    'setNewPassword',

    // Metadata
    'getMetadataByType',
    'getAllMetadata',

    // Ratings
    'getRatingsByRecipe',
  ],

  // Authenticated user operations
  userOperations: [
    // Recipe operations
    'createRecipe',
    'editRecipe',
    'deleteRecipe',

    // User mutations
    'editUser',
    'deleteUser',
    'changePassword',

    // Favorite recipes
    'addToFavoriteRecipes',
    'removeFromFavoriteRecipes',
    'getFavoriteRecipes',

    // Metadata
    'getMetadataByKey',

    // Ratings
    'rateRecipe',
    'deleteRating',
  ],

  // Blogger operations (own recipes management)
  // Currently same as user operations, extend as needed
  bloggerOperations: [],

  // Admin operations
  adminOperations: [
    // User management
    'deleteAllUsers',
    'cleanUserRecipes',

    // Content moderation
    'deleteAllRecipes',

    // Metadata management
    'createMetadata',
    'deleteMetadata',
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
  // Public operation - anyone can execute
  if (isPublicOperation(operationName)) {
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
      operationsConfig.userOperations.includes(operationName) ||
      operationsConfig.bloggerOperations.includes(operationName)
    );
  }

  // User operations
  if (userRole === 'USER') {
    return operationsConfig.userOperations.includes(operationName);
  }

  return false;
};

/**
 * Returns which roles can access an operation
 */
export const getRequiredRolesForOperation = (
  operationName: string,
): UserRole[] | 'PUBLIC' => {
  if (isPublicOperation(operationName)) {
    return 'PUBLIC';
  }

  if (operationsConfig.adminOperations.includes(operationName)) {
    return ['ADMIN'];
  }

  if (operationsConfig.bloggerOperations.includes(operationName)) {
    return ['ADMIN', 'BLOGGER'];
  }

  if (operationsConfig.userOperations.includes(operationName)) {
    return ['ADMIN', 'BLOGGER', 'USER'];
  }

  // If not configured, it's protected (admin only)
  return ['ADMIN'];
};
