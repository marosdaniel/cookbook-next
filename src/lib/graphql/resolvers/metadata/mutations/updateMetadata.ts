import type { MutationUpdateMetadataArgs } from '@/lib/graphql/generated/resolvers-types';
import { AdminService } from '@/lib/services/AdminService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAdminActor } from '../utils';

export const updateMetadata = async (
  _: unknown,
  { id, metadataUpdateInput }: MutationUpdateMetadataArgs,
  context: GraphQLContext,
) => {
  const { actorId, actorRole } = resolveAdminActor(context);

  return AdminService.updateMetadata(
    actorId,
    actorRole,
    id,
    metadataUpdateInput,
  );
};
