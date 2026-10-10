import { describe, expect, it, vi } from 'vitest';

vi.mock('@apollo/client', () => ({
  CombinedGraphQLErrors: {
    is: (error: unknown) =>
      typeof error === 'object' &&
      error !== null &&
      'isCombined' in error &&
      error.isCombined === true,
  },
}));

import type { AdminMetadataItem } from './types';
import {
  getReorderedIds,
  hasGraphQLErrorCode,
  isMetadataTypeName,
  sortByOrder,
  validateMetadataKey,
} from './utils';

const translate = (key: string) => `t:${key}`;

const items: AdminMetadataItem[] = [
  {
    id: 'c',
    type: 'CATEGORY',
    key: 'dessert',
    translationKey: 'category-dessert',
    sortOrder: 30,
    isActive: true,
  },
  {
    id: 'a',
    type: 'CATEGORY',
    key: 'soup',
    translationKey: 'category-soup',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'b',
    type: 'CATEGORY',
    key: 'salad',
    translationKey: 'category-salad',
    sortOrder: 20,
    isActive: false,
  },
];

describe('admin metadata utils', () => {
  it('sorts items by sort order without mutating the input', () => {
    expect(sortByOrder(items).map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(items[0].id).toBe('c');
  });

  it('moves an item one position up or down', () => {
    expect(getReorderedIds(items, 'b', 'up')).toEqual(['b', 'a', 'c']);
    expect(getReorderedIds(items, 'b', 'down')).toEqual(['a', 'c', 'b']);
  });

  it('returns null when the move would leave the list', () => {
    expect(getReorderedIds(items, 'a', 'up')).toBeNull();
    expect(getReorderedIds(items, 'c', 'down')).toBeNull();
    expect(getReorderedIds(items, 'missing', 'up')).toBeNull();
  });

  it('recognises metadata type names', () => {
    expect(isMetadataTypeName('DIET')).toBe(true);
    expect(isMetadataTypeName('UNKNOWN')).toBe(false);
  });

  it('validates keys as lowercase hyphenated slugs', () => {
    expect(validateMetadataKey('   ', translate)).toBe(
      't:validation.keyRequired',
    );
    expect(validateMetadataKey('Gluten Free', translate)).toBe(
      't:validation.keyFormat',
    );
    expect(validateMetadataKey('a'.repeat(65), translate)).toBe(
      't:validation.keyFormat',
    );
    expect(validateMetadataKey(' gluten-free ', translate)).toBeNull();
  });

  it('detects a GraphQL error code in combined errors only', () => {
    const conflict = {
      isCombined: true,
      errors: [{ message: 'taken', extensions: { code: 'CONFLICT' } }],
    };

    expect(hasGraphQLErrorCode(conflict, 'CONFLICT')).toBe(true);
    expect(hasGraphQLErrorCode(conflict, 'FORBIDDEN')).toBe(false);
    expect(hasGraphQLErrorCode(new Error('network'), 'CONFLICT')).toBe(false);
  });
});
