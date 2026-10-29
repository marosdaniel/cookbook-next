import type { Session } from 'next-auth';
import { auth } from '@/lib/auth/auth';
import {
  createIsFavoriteLoader,
  createRatingsLoader,
  createRecipeAuthorLoader,
  createUserFavoriteRecipesLoader,
  createUserRatingLoader,
  createUserRecipesLoader,
} from '@/lib/dataloader/loaders';
import { prisma } from '@/lib/prisma/prisma';
import {
  type RequestStoreContext,
  requestStorage,
} from '@/server/platform/requestContext';
import type { GraphQLContext } from '@/types/graphql/context';

export { type RequestStoreContext, requestStorage };

export const resolveSessionSafely = async (): Promise<Session | null> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const createGraphQLContext = async (): Promise<GraphQLContext> => {
  const store = requestStorage.getStore();
  const session = store ? store.session : await resolveSessionSafely();
  const userId = session?.user?.id;

  return {
    userId,
    role: session?.user?.role,
    operationName: null,
    requestId: store?.requestId ?? 'unknown',
    clientKey: store?.clientKey,
    prisma,
    // DataLoaders are instantiated fresh per request so their internal
    // cache is scoped to a single request and never leaks between users.
    loaders: {
      ratings: createRatingsLoader(prisma),
      isFavorite: userId ? createIsFavoriteLoader(prisma, userId) : null,
      userRating: userId ? createUserRatingLoader(prisma, userId) : null,
      recipeAuthor: createRecipeAuthorLoader(prisma),
      userRecipes: createUserRecipesLoader(prisma),
      userFavoriteRecipes: createUserFavoriteRecipesLoader(prisma),
    },
  };
};
