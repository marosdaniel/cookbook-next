import type { UserRole } from '@/types/user';

/**
 * Route authorization policy - centralized route family to role mapping
 *
 * This definition is authoritative for:
 * - Proxy early rejection (/src/proxy.ts)
 * - Server layout guards (admin, /me routes)
 * - Frontend route components and navigation
 *
 * Principle: Server layout guards are authoritative; proxy acts as early rejection.
 */

export type RouteFamily = 'public' | 'auth' | 'user-profile' | 'admin';

export interface RoutePolicy {
  family: RouteFamily;
  /** Required role(s) for access. 'PUBLIC' means no auth required */
  requiredRoles: UserRole[] | 'PUBLIC';
  /** Description of the route family's purpose */
  purpose: string;
}

/**
 * Map of route family patterns to their authorization requirements
 */
export const ROUTE_POLICIES: Record<RouteFamily, RoutePolicy> = {
  public: {
    family: 'public',
    requiredRoles: 'PUBLIC',
    purpose:
      'Public pages: home, recipes list, recipe detail, policies, auth pages',
  },
  auth: {
    family: 'auth',
    requiredRoles: 'PUBLIC',
    purpose:
      'Authentication UI: login, signup, reset password (shown to anyone, redirect if already logged in)',
  },
  'user-profile': {
    family: 'user-profile',
    requiredRoles: ['USER', 'BLOGGER', 'ADMIN'],
    purpose:
      'User private pages: /me/*, profile, settings, my recipes, favorites, following',
  },
  admin: {
    family: 'admin',
    requiredRoles: ['ADMIN'],
    purpose:
      'Admin pages: /admin/*, user management, content moderation, system config',
  },
};

/**
 * Route pattern matcher - determines which policy applies to a pathname
 */
export const getRouteFamilyForPath = (pathname: string): RouteFamily => {
  if (pathname.startsWith('/admin')) {
    return 'admin';
  }

  if (pathname.startsWith('/me')) {
    return 'user-profile';
  }

  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password'
  ) {
    return 'auth';
  }

  return 'public';
};

/**
 * Check if a user role is allowed to access a route family
 */
export const canAccessRouteFamily = (
  routeFamily: RouteFamily,
  userRole?: UserRole,
): boolean => {
  const policy = ROUTE_POLICIES[routeFamily];

  // Public route - no auth required
  if (policy.requiredRoles === 'PUBLIC') {
    return true;
  }

  // No user role, but route requires auth
  if (!userRole) {
    return false;
  }

  // Check if user role is in the required list
  return policy.requiredRoles.includes(userRole);
};

/**
 * Get the policy for a given pathname
 */
export const getPolicyForPath = (pathname: string): RoutePolicy => {
  const family = getRouteFamilyForPath(pathname);
  return ROUTE_POLICIES[family];
};
