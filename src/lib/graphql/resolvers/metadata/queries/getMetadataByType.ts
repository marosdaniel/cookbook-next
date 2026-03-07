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
  context: GraphQLContext,
) => {
  // Metadata is handled offline for now
  return [];
};
