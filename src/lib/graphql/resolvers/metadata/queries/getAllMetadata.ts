import type { GraphQLContext } from '@/types/graphql/context';

/**
 * Get all metadata from database
 */
export const getAllMetadata = async (
  _parent: unknown,
  _args: unknown,
  context: GraphQLContext,
) => {
  // Metadata is currently handled offline
  const metadata: any[] = [];

  return metadata;
};
