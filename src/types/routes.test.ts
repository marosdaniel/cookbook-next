import { describe, expect, it } from 'vitest';

import {
  AUTH_ROUTES,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  isAuthRoute,
  isProtectedRoute,
  isPublicRoute,
} from './routes';

describe('routes helpers', () => {
  it('detects auth routes and nested auth paths', () => {
    expect(isAuthRoute(AUTH_ROUTES.LOGIN)).toBe(true);
    expect(isAuthRoute('/reset-password/token')).toBe(true);
    expect(isAuthRoute('/recipes')).toBe(false);
  });

  it('detects public routes and nested public paths', () => {
    expect(isPublicRoute(PUBLIC_ROUTES.HOME)).toBe(true);
    expect(isPublicRoute('/recipes/latest')).toBe(true);
    expect(isPublicRoute(PROTECTED_ROUTES.PROFILE)).toBe(false);
  });

  it('detects protected routes and nested protected paths', () => {
    expect(isProtectedRoute(PROTECTED_ROUTES.PROFILE)).toBe(true);
    expect(isProtectedRoute('/recipes/create')).toBe(true);
    expect(isProtectedRoute(PUBLIC_ROUTES.PRIVACY_POLICY)).toBe(false);
  });

  it('exposes the route constants used by the app', () => {
    expect(PUBLIC_ROUTES.RECIPES).toBe('/recipes');
    expect(AUTH_ROUTES.SIGNUP).toBe('/signup');
    expect(PROTECTED_ROUTES.FOLLOWING).toBe('/me/following');
  });
});
