import { describe, expect, it } from 'vitest';

import {
  canUserPerformOperation,
  getRequiredRolesForOperation,
  operationsConfig,
} from './operationsConfig';

describe('operationsConfig', () => {
  it('treats public operations as available to everyone', () => {
    expect(canUserPerformOperation('getRecipes')).toBe(true);
    expect(canUserPerformOperation('getRecipes', undefined)).toBe(true);
  });

  it('blocks protected operations when there is no user role', () => {
    expect(canUserPerformOperation('createRecipe')).toBe(false);
  });

  it('allows admins to perform any operation', () => {
    expect(canUserPerformOperation('deleteAllUser', 'ADMIN')).toBe(true);
    expect(canUserPerformOperation('createMetadata', 'ADMIN')).toBe(true);
  });

  it('allows bloggers to perform user and blogger operations', () => {
    expect(canUserPerformOperation('createRecipe', 'BLOGGER')).toBe(true);
    expect(canUserPerformOperation('deleteAllUser', 'BLOGGER')).toBe(false);
  });

  it('allows regular users to perform user operations only', () => {
    expect(canUserPerformOperation('createRecipe', 'USER')).toBe(true);
    expect(canUserPerformOperation('deleteAllUser', 'USER')).toBe(false);
  });

  it('returns the expected role requirements for known operations', () => {
    expect(getRequiredRolesForOperation('getRecipes')).toBe('PUBLIC');
    expect(getRequiredRolesForOperation('createRecipe')).toEqual([
      'ADMIN',
      'BLOGGER',
      'USER',
    ]);
    expect(getRequiredRolesForOperation('deleteAllUser')).toEqual(['ADMIN']);
    expect(getRequiredRolesForOperation('unknownOperation')).toEqual(['ADMIN']);
  });

  it('keeps the operations config lists populated', () => {
    expect(operationsConfig.publicOperations).toContain('getRecipes');
    expect(operationsConfig.userOperations).toContain('createRecipe');
    expect(operationsConfig.adminOperations).toContain('deleteAllUser');
  });
});
