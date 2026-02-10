import type { GraphQLContext } from '@/types/graphql/context';

/**
 * Get all metadata from database
 */
export const getAllMetadata = async (
  _parent: unknown,
  _args: unknown,
  context: GraphQLContext,
) => {
  const { prisma } = context;

  const metadata = await prisma.metadata.findMany({
    orderBy: [{ type: 'asc' }, { label: 'asc' }],
  });

  return metadata;
};
