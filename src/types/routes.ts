/**
 * Application Routes Configuration
 */

// Routes accessible to everyone (no authentication required)
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  RECIPES: '/recipes',
  RECIPES_LATEST: '/recipes/latest',
  PRIVACY_POLICY: '/privacy-policy',
  COOKIE_POLICY: '/cookie-policy',
  TERMS_OF_SERVICE: '/terms-of-service',
} as const;

// Authentication routes (Login, Register, Reset Password)
// These routes typically don't show the main navigation bar
export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
} as const;

// Routes that require authentication (Protected)
export const PROTECTED_ROUTES = {
  PROFILE: '/me/profile',
  RECIPES_CREATE: '/recipes/create',
  RECIPES_MY: '/me/my-recipes',
  RECIPES_FAVORITES: '/me/favorite-recipes',
  FOLLOWING: '/me/following',
  SETTINGS: '/settings',
} as const;

// Combined type for all routes
export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];
export type ProtectedRoute =
  (typeof PROTECTED_ROUTES)[keyof typeof PROTECTED_ROUTES];

export type AppRoute = PublicRoute | AuthRoute | ProtectedRoute;

/**
 * Helper to check if a path is an auth route (e.g. for hiding navbar)
 */
export const isAuthRoute = (path: string): boolean => {
  return Object.values(AUTH_ROUTES).some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
};

/**
 * Helper to check if a path is public
 */
export const isPublicRoute = (path: string): boolean => {
  return Object.values(PUBLIC_ROUTES).some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
};

/**
 * Helper to check if a path is protected (requires authentication)
 */
export const isProtectedRoute = (path: string): boolean => {
  return Object.values(PROTECTED_ROUTES).some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
};
