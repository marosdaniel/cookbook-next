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
  const { prisma } = context;
  const { type } = args;

  const metadata = await prisma.metadata.findMany({
    where: {
      type: type.toUpperCase(),
    },
    orderBy: { label: 'asc' },
  });

  return metadata;
};
