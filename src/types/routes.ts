import type { Route } from 'next';

/**
 * Builds a URL for the dynamic recipe detail route.
 *
 * The assertion is intentionally isolated here: Next.js cannot infer that a
 * runtime string interpolation is a valid filesystem route.
 */
const recipeDetailRoute = (idOrSlug: string): Route =>
  `/recipes/${encodeURIComponent(idOrSlug)}` as Route;

/**
 * Builds a URL for the dynamic recipe edit route.
 */
const recipeEditRoute = (idOrSlug: string): Route =>
  `/recipes/${encodeURIComponent(idOrSlug)}/edit` as Route;

export const recipeSearchRoute = (searchParams: URLSearchParams): Route =>
  `${PUBLIC_ROUTES.RECIPES}?${searchParams.toString()}` as Route;

/**
 * Application Routes Configuration
 */

// Routes accessible to everyone without authentication.
export const PUBLIC_ROUTES = {
  HOME: '/',
  // ABOUT: '/about',
  RECIPES: '/recipes',
  RECIPE_DETAIL: recipeDetailRoute,
  PRIVACY_POLICY: '/privacy-policy',
  COOKIE_POLICY: '/cookie-policy',
  // TERMS_OF_SERVICE: '/terms-of-service',
} as const;

// Authentication routes.
export const AUTH_ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
} as const;

// Routes requiring authentication.
export const PROTECTED_ROUTES = {
  PROFILE: '/me/profile',
  RECIPES_CREATE: '/recipes/create',
  RECIPES_EDIT: recipeEditRoute,
  RECIPES_MY: '/me/my-recipes',
  RECIPES_FAVORITES: '/me/favorite-recipes',
  FOLLOWING: '/me/following',
  // SETTINGS: '/settings',
} as const;

type StaticPublicRoute = Exclude<
  (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES],
  (idOrSlug: string) => Route
>;

type StaticProtectedRoute = Exclude<
  (typeof PROTECTED_ROUTES)[keyof typeof PROTECTED_ROUTES],
  (idOrSlug: string) => Route
>;

export type PublicRoute =
  | StaticPublicRoute
  | ReturnType<typeof recipeDetailRoute>;

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];

export type ProtectedRoute =
  | StaticProtectedRoute
  | ReturnType<typeof recipeEditRoute>;

export type AppRoute = PublicRoute | AuthRoute | ProtectedRoute;

/**
 * Checks whether a pathname belongs to an authentication page.
 */
export const isAuthRoute = (path: string): boolean =>
  path === AUTH_ROUTES.LOGIN ||
  path === AUTH_ROUTES.SIGNUP ||
  path === AUTH_ROUTES.RESET_PASSWORD ||
  path.startsWith(`${AUTH_ROUTES.LOGIN}/`) ||
  path.startsWith(`${AUTH_ROUTES.SIGNUP}/`) ||
  path.startsWith(`${AUTH_ROUTES.RESET_PASSWORD}/`);

/**
 * Checks whether a pathname is publicly accessible.
 */
export const isPublicRoute = (path: string): boolean =>
  path === PUBLIC_ROUTES.HOME ||
  path === PUBLIC_ROUTES.RECIPES ||
  path === PUBLIC_ROUTES.PRIVACY_POLICY ||
  path === PUBLIC_ROUTES.COOKIE_POLICY ||
  /^\/recipes\/[^/]+$/.test(path);

/**
 * Checks whether a pathname requires authentication.
 */
export const isProtectedRoute = (path: string): boolean =>
  path === PROTECTED_ROUTES.PROFILE ||
  path === PROTECTED_ROUTES.RECIPES_CREATE ||
  path === PROTECTED_ROUTES.RECIPES_MY ||
  path === PROTECTED_ROUTES.RECIPES_FAVORITES ||
  path === PROTECTED_ROUTES.FOLLOWING ||
  /^\/recipes\/[^/]+\/edit$/.test(path);
