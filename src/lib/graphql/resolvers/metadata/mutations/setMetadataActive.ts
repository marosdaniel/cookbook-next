import type { MutationSetMetadataActiveArgs } from '@/lib/graphql/generated/resolvers-types';
import { AdminService } from '@/lib/services/AdminService';
import type { GraphQLContext } from '@/types/graphql/context';
import { resolveAdminActor } from '../utils';

export const setMetadataActive = async (
  _: unknown,
  { id, isActive }: MutationSetMetadataActiveArgs,
  context: GraphQLContext,
) => {
  const { actorId, actorRole } = resolveAdminActor(context);

  return AdminService.setMetadataActive(actorId, actorRole, id, isActive);
};
