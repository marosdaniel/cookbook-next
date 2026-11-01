import { describe, expect, it } from 'vitest';
import {
  ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION,
  assertAdminRole,
  assertDestructiveConfirmation,
  isAdminRole,
} from './policy';

describe('admin policy', () => {
  describe('isAdminRole', () => {
    it('is true only for the ADMIN role', () => {
      expect(isAdminRole('ADMIN')).toBe(true);
      expect(isAdminRole('USER')).toBe(false);
      expect(isAdminRole('admin')).toBe(false);
      expect(isAdminRole(undefined)).toBe(false);
    });
  });

  describe('assertAdminRole', () => {
    it('passes for admins', () => {
      expect(() => assertAdminRole('ADMIN')).not.toThrow();
    });

    it('throws FORBIDDEN for other roles', () => {
      expect(() => assertAdminRole('USER')).toThrow(
        'Unauthorized operation - admin rights required',
      );
      expect(() => assertAdminRole(undefined)).toThrow();
    });
  });

  describe('assertDestructiveConfirmation', () => {
    it('passes with the exact confirmation token', () => {
      expect(() =>
        assertDestructiveConfirmation(ADMIN_DESTRUCTIVE_ACTION_CONFIRMATION),
      ).not.toThrow();
    });

    it('throws BAD_REQUEST for a missing or wrong confirmation', () => {
      expect(() => assertDestructiveConfirmation()).toThrow(
        'Destructive admin action requires explicit confirmation',
      );
      expect(() => assertDestructiveConfirmation('delete_all')).toThrow();
    });
  });
});
