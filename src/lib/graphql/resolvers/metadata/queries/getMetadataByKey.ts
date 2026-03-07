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
  context: GraphQLContext,
) => {
  // Metadata is handled offline for now
  return null;
};
