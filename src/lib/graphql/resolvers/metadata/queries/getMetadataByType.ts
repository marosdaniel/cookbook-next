import { METADATA } from '@/lib/data/metadata';
import type { GraphQLContext } from '@/types/graphql/context';

interface GetMetadataByTypeArgs {
  type: string;
}

/**
 * Get metadata by type from database
 */
export const getMetadataByType = async (
  _parent: unknown,
  args: GetMetadataByTypeArgs,
  _context: GraphQLContext,
) => {
  return METADATA.filter(
    (m) => m.type.toLowerCase() === args.type.toLowerCase(),
  );
};
