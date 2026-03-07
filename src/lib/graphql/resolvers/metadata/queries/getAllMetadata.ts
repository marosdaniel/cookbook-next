import { METADATA } from '@/lib/data/metadata';
import type { GraphQLContext } from '@/types/graphql/context';

/**
 * Get all metadata from database
 */
export const getAllMetadata = async (
  _parent: unknown,
  _args: unknown,
  _context: GraphQLContext,
) => {
  return METADATA;
};
