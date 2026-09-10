import type {
  QueryGetRecipesByUserIdArgs,
  RequireFields,
} from '@/lib/graphql/generated/resolvers-types';
import { RecipeService } from '@/lib/services/RecipeService';
import type { GraphQLContext } from '@/types/graphql/context';

export const getRecipesByUserId = async (
  _: unknown,
  { userId, limit }: RequireFields<QueryGetRecipesByUserIdArgs, 'userId'>,
  _context: GraphQLContext,
) => {
  const result = await RecipeService.getRecipesByUserId(
    userId,
    limit ?? undefined,
  );
  return {
    ...result,
    pageInfo: { hasNextPage: false, endCursor: null },
  };
};
