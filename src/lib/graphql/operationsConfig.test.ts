import { describe, expect, it } from 'vitest';

import { OPERATION_NAMES } from '@/lib/graphql/operations';

import {
  canUserPerformOperation,
  getRequiredRolesForOperation,
  operationsConfig,
} from './operationsConfig';

describe('operationsConfig', () => {
  it('treats public operations as available to everyone', () => {
    expect(canUserPerformOperation('getRecipes')).toBe(true);
    expect(canUserPerformOperation('getRecipes')).toBe(true);
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
    expect(operationsConfig.publicOperations).toContain(
      OPERATION_NAMES.GET_RECIPES,
    );
    expect(operationsConfig.userOperations).toContain(
      OPERATION_NAMES.CREATE_RECIPE,
    );
    expect(operationsConfig.adminOperations).toContain(
      OPERATION_NAMES.DELETE_ALL_USER,
    );
  });

  it('includes every operation name from the shared operation list in the config', () => {
    const configuredOperations = new Set([
      ...operationsConfig.publicOperations,
      ...operationsConfig.userOperations,
      ...operationsConfig.bloggerOperations,
      ...operationsConfig.adminOperations,
    ]);

    Object.values(OPERATION_NAMES).forEach((operationName) => {
      expect(configuredOperations.has(operationName)).toBe(true);
    });
  });
});
