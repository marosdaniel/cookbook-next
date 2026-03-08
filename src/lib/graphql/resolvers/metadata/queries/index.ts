import { METADATA } from '@/lib/data/metadata';
import type { MetadataEntry } from '@/lib/data/types';
import type { GraphQLContext } from '@/types/graphql/context';

export interface GetMetadataByKeyArgs {
  key: string;
}

export interface GetMetadataByTypeArgs {
  type: string;
}

/**
 * Get all metadata entries
 */
export const getAllMetadata = async (
  _parent: unknown,
  _args: unknown,
  _context: GraphQLContext,
): Promise<MetadataEntry[]> => {
  return METADATA;
};

/**
 * Get a specific metadata entry by its unique key
 */
export const getMetadataByKey = async (
  _parent: unknown,
  args: GetMetadataByKeyArgs,
  _context: GraphQLContext,
): Promise<MetadataEntry | null> => {
  return METADATA.find((m) => m.key === args.key) || null;
};

/**
 * Get all metadata entries of a specific type (e.g., 'CATEGORY', 'UNIT')
 */
export const getMetadataByType = async (
  _parent: unknown,
  args: GetMetadataByTypeArgs,
  _context: GraphQLContext,
): Promise<MetadataEntry[]> => {
  return METADATA.filter(
    (m) => m.type.toLowerCase() === args.type.toLowerCase(),
  );
};
