import { CombinedGraphQLErrors } from '@apollo/client';
import {
  METADATA_KEY_MAX_LENGTH,
  METADATA_KEY_PATTERN,
  METADATA_TYPES,
  type MetadataTypeName,
} from '@/lib/metadata/metadataTypes';
import type { AdminMetadataItem } from './types';

export type MoveDirection = 'up' | 'down';

export const isMetadataTypeName = (value: string): value is MetadataTypeName =>
  (METADATA_TYPES as readonly string[]).includes(value);

export const sortByOrder = (
  items: readonly AdminMetadataItem[],
): AdminMetadataItem[] => [...items].sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Full id order after moving one item a single position, or null when the item
 * is already at that edge. The list must contain every item of the type.
 */
export const getReorderedIds = (
  items: readonly AdminMetadataItem[],
  id: string,
  direction: MoveDirection,
): string[] | null => {
  const ordered = sortByOrder(items);
  const index = ordered.findIndex((item) => item.id === id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (index === -1 || targetIndex < 0 || targetIndex >= ordered.length) {
    return null;
  }

  const reordered = [...ordered];
  [reordered[index], reordered[targetIndex]] = [
    reordered[targetIndex],
    reordered[index],
  ];

  return reordered.map((item) => item.id);
};

export const validateMetadataKey = (
  value: string,
  translate: (key: string) => string,
): string | null => {
  const trimmed = value.trim();

  if (!trimmed) {
    return translate('validation.keyRequired');
  }

  if (
    trimmed.length > METADATA_KEY_MAX_LENGTH ||
    !METADATA_KEY_PATTERN.test(trimmed)
  ) {
    return translate('validation.keyFormat');
  }

  return null;
};

export const hasGraphQLErrorCode = (error: unknown, code: string): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some((item) => item.extensions?.code === code);
