import type { MutationCreateMetadataArgs } from '@/lib/graphql/generated/resolvers-types';
import { AdminService } from '@/lib/services/AdminService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAdminActor } from '../utils';

export const createMetadata = async (
  _: unknown,
  { metadataCreateInput }: MutationCreateMetadataArgs,
  context: GraphQLContext,
) => {
  const { actorId, actorRole } = resolveAdminActor(context);

  return AdminService.createMetadata(actorId, actorRole, metadataCreateInput);
};
