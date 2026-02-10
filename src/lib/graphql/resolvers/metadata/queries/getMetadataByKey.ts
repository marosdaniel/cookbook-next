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
  const { prisma } = context;
  const { key } = args;

  const metadata = await prisma.metadata.findUnique({
    where: {
      key,
    },
  });

  if (!metadata) {
    throw new Error(`Metadata with key "${key}" not found`);
  }

  return metadata;
};
