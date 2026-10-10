import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import type { GraphQLContext } from '@/types/graphql/context';

export const resolveAdminActor = ({
  userId,
  role,
}: GraphQLContext): { actorId: string; actorRole: string } => {
  if (!userId || !role) {
    return throwCustomError(
      'Unauthenticated operation - no user found',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  return { actorId: userId, actorRole: role };
};
