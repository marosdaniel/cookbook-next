import type { MutationReorderMetadataArgs } from '@/lib/graphql/generated/resolvers-types';
import { AdminService } from '@/lib/services/AdminService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAdminActor } from '../utils';

export const reorderMetadata = async (
  _: unknown,
  { type, orderedIds }: MutationReorderMetadataArgs,
  context: GraphQLContext,
) => {
  const { actorId, actorRole } = resolveAdminActor(context);

  return AdminService.reorderMetadata(actorId, actorRole, type, orderedIds);
};
