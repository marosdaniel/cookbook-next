const RECIPE_LIST_NAMESPACE = 'recipes:list';
const RECIPE_LIST_VERSION_KEY = `${RECIPE_LIST_NAMESPACE}:version`;

const stableSerialize = (value: Record<string, unknown>) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(value).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  );

export const cacheKeys = {
  recipeListVersion: RECIPE_LIST_VERSION_KEY,
  recipeList: (
    version: number,
    limit: number | undefined,
    filter: unknown,
    after: string | undefined,
  ) =>
    `${RECIPE_LIST_NAMESPACE}:v${version}:${limit ?? 'all'}:${after ?? 'first'}:${stableSerialize((filter ?? {}) as Record<string, unknown>)}`,
  recipeDetail: (id: string) => `recipe:${id}`,
  recipeLookup: (idOrSlug: string) => `recipe:lookup:${idOrSlug}`,
  userRecipes: (userId: string, limit: number | undefined) =>
    `recipes:user:${userId}:${limit ?? 'all'}`,
  userFavorites: (userId: string, limit: number | undefined) =>
    `user:${userId}:favorites:${limit ?? 'all'}`,
  userFollowing: (userId: string, limit: number | undefined) =>
    `user:${userId}:following:${limit ?? 'all'}`,
};
