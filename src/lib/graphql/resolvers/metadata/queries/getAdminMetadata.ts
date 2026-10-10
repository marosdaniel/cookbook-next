import type { QueryGetAdminMetadataArgs } from '@/lib/graphql/generated/resolvers-types';
import { AdminService } from '@/lib/services/AdminService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getAdminMetadata = async (
  _: unknown,
  { type }: QueryGetAdminMetadataArgs,
  { role }: GraphQLContext,
) => AdminService.listMetadata(role, type ?? undefined);
