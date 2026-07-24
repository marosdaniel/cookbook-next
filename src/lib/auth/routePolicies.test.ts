import { describe, expect, it } from 'vitest';
import type { UserRole } from '@/types/user';
import {
  canAccessRouteFamily,
  getPolicyForPath,
  getRouteFamilyForPath,
  ROUTE_POLICIES,
} from './routePolicies';

describe('routePolicies.ts', () => {
  const userRole: UserRole = 'USER';
  const bloggerRole: UserRole = 'BLOGGER';
  const adminRole: UserRole = 'ADMIN';

  describe('getRouteFamilyForPath', () => {
    it('should identify admin routes', () => {
      expect(getRouteFamilyForPath('/admin')).toBe('admin');
      expect(getRouteFamilyForPath('/admin/users')).toBe('admin');
      expect(getRouteFamilyForPath('/admin/dashboard')).toBe('admin');
    });

    it('should identify user-profile routes', () => {
      expect(getRouteFamilyForPath('/me/profile')).toBe('user-profile');
      expect(getRouteFamilyForPath('/me/my-recipes')).toBe('user-profile');
      expect(getRouteFamilyForPath('/me/favorite-recipes')).toBe(
        'user-profile',
      );
      expect(getRouteFamilyForPath('/me/following')).toBe('user-profile');
    });

    it('should identify auth routes', () => {
      expect(getRouteFamilyForPath('/login')).toBe('auth');
      expect(getRouteFamilyForPath('/signup')).toBe('auth');
      expect(getRouteFamilyForPath('/reset-password')).toBe('auth');
    });

    it('should identify public routes', () => {
      expect(getRouteFamilyForPath('/')).toBe('public');
      expect(getRouteFamilyForPath('/recipes')).toBe('public');
      expect(getRouteFamilyForPath('/recipes/123')).toBe('public');
      expect(getRouteFamilyForPath('/privacy-policy')).toBe('public');
    });
  });

  describe('canAccessRouteFamily', () => {
    it('should allow anyone to access public routes', () => {
      expect(canAccessRouteFamily('public', undefined)).toBe(true);
      expect(canAccessRouteFamily('public', userRole)).toBe(true);
      expect(canAccessRouteFamily('public', bloggerRole)).toBe(true);
      expect(canAccessRouteFamily('public', adminRole)).toBe(true);
    });

    it('should allow anyone to access auth routes', () => {
      expect(canAccessRouteFamily('auth', undefined)).toBe(true);
      expect(canAccessRouteFamily('auth', userRole)).toBe(true);
      expect(canAccessRouteFamily('auth', adminRole)).toBe(true);
    });

    it('should require authentication for user-profile routes', () => {
      expect(canAccessRouteFamily('user-profile', undefined)).toBe(false);
      expect(canAccessRouteFamily('user-profile', userRole)).toBe(true);
      expect(canAccessRouteFamily('user-profile', bloggerRole)).toBe(true);
      expect(canAccessRouteFamily('user-profile', adminRole)).toBe(true);
    });

    it('should require ADMIN role for admin routes', () => {
      expect(canAccessRouteFamily('admin', undefined)).toBe(false);
      expect(canAccessRouteFamily('admin', userRole)).toBe(false);
      expect(canAccessRouteFamily('admin', bloggerRole)).toBe(false);
      expect(canAccessRouteFamily('admin', adminRole)).toBe(true);
    });
  });

  describe('getPolicyForPath', () => {
    it('should return the correct policy for a given path', () => {
      const adminPolicy = getPolicyForPath('/admin');
      expect(adminPolicy.family).toBe('admin');
      expect(adminPolicy.requiredRoles).toEqual(['ADMIN']);

      const profilePolicy = getPolicyForPath('/me/profile');
      expect(profilePolicy.family).toBe('user-profile');
      expect(profilePolicy.requiredRoles).toEqual(['USER', 'BLOGGER', 'ADMIN']);

      const publicPolicy = getPolicyForPath('/');
      expect(publicPolicy.family).toBe('public');
      expect(publicPolicy.requiredRoles).toBe('PUBLIC');
    });
  });

  describe('ROUTE_POLICIES', () => {
    it('should define all route families', () => {
      expect(ROUTE_POLICIES).toHaveProperty('public');
      expect(ROUTE_POLICIES).toHaveProperty('auth');
      expect(ROUTE_POLICIES).toHaveProperty('user-profile');
      expect(ROUTE_POLICIES).toHaveProperty('admin');
    });

    it('should define purpose for each policy', () => {
      Object.values(ROUTE_POLICIES).forEach((policy) => {
        expect(policy.purpose).toBeDefined();
        expect(policy.purpose.length).toBeGreaterThan(0);
      });
    });
  });
});
