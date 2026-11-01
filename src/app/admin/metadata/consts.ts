import type { AdminMetadataItem } from './types';

// Refetched after every admin write; the public list is included so open recipe forms stay current.
export const ADMIN_METADATA_REFETCH_QUERIES = [
  'getAdminMetadata',
  'getAllMetadata',
];

// Business errors the global Apollo error link leaves to the caller, so the
// admin client must report them itself.
export const LOCALLY_REPORTED_GRAPHQL_ERROR_CODES = [
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'CONFLICT',
];

export const NO_ITEMS: readonly AdminMetadataItem[] = [];
export const SKELETON_ROWS = [1, 2, 3, 4, 5];

export const STAGGER_MAX_ROWS = 15;
export const STAGGER_STEP_SECONDS = 0.03;
