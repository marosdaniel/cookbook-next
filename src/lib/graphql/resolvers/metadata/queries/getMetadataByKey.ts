import { METADATA } from '@/lib/data/metadata';
import type { GraphQLContext } from '@/types/graphql/context';

interface GetMetadataByKeyArgs {
  key: string;
}

/**
 * Get metadata by key from database
 */
export const getMetadataByKey = async (
  _parent: unknown,
  args: GetMetadataByKeyArgs,
  _context: GraphQLContext,
) => {
  return METADATA.find((m) => m.key === args.key) || null;
};
