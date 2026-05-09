import type {
  createIsFavoriteLoader,
  createRatingsLoader,
  createUserRatingLoader,
} from '@/lib/dataloader/loaders';
import type { prisma } from '@/lib/prisma/prisma';
import type { UserRole } from '../user';

/**
 * GraphQL context interface - available to all resolvers
 */
export interface GraphQLContext {
  userId?: string;
  role?: UserRole;
  operationName?: string | null;
  prisma: typeof prisma;
  /** DataLoader instances — created fresh per request to scope caching correctly */
  loaders: {
    ratings: ReturnType<typeof createRatingsLoader>;
    isFavorite: ReturnType<typeof createIsFavoriteLoader> | null;
    userRating: ReturnType<typeof createUserRatingLoader> | null;
  };
}
