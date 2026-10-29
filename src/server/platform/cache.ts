import { cacheKeys } from '@/lib/cache/cacheKeys';
import { redis } from '@/lib/redis/redis';
import { logger } from './logger';

export { cacheKeys };

export const LIST_CACHE_TTL_SECONDS = 15;
export const DETAIL_CACHE_TTL_SECONDS = 60;
export const SESSION_VERSION_CACHE_TTL_SECONDS = 60;

// Keys are deleted in batches so a bulk invalidation does not fire thousands
// of concurrent Redis requests at once.
const KEY_DELETE_BATCH_SIZE = 100;

const DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'followedAt',
  'resetPasswordExpires',
]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export function reviveCachedDates<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => reviveCachedDates(item)) as unknown as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (
        DATE_FIELD_NAMES.has(key) &&
        typeof entry === 'string' &&
        ISO_DATE_PATTERN.test(entry)
      ) {
        output[key] = new Date(entry);
      } else {
        output[key] = reviveCachedDates(entry);
      }
    }
    return output as T;
  }

  return value;
}

const inFlightLoads = new Map<string, Promise<unknown>>();

export async function getCachedValue<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw !== null && raw !== undefined) {
      return reviveCachedDates(raw as T);
    }
  } catch (error) {
    logger.warn({ err: error, key }, 'Redis cache get error');
  }
  return null;
}

export async function setCachedValue(
  key: string,
  value: unknown,
  ttlSeconds: number = DETAIL_CACHE_TTL_SECONDS,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, value);
  } catch (error) {
    logger.warn({ err: error, key }, 'Redis cache set error');
  }
}

export async function cached<T>(opts: {
  key: string;
  ttlSeconds: number;
  load: () => Promise<T>;
  shouldCache?: (value: T) => boolean;
}): Promise<T> {
  const { key, ttlSeconds, load, shouldCache } = opts;

  const hit = await getCachedValue<T>(key);
  if (hit !== null && (!shouldCache || shouldCache(hit))) {
    return hit;
  }

  const existingPromise = inFlightLoads.get(key) as Promise<T> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  const loadPromise = (async () => {
    try {
      const fresh = await load();
      if (!shouldCache || shouldCache(fresh)) {
        await setCachedValue(key, fresh, ttlSeconds);
      }
      return fresh;
    } finally {
      inFlightLoads.delete(key);
    }
  })();

  inFlightLoads.set(key, loadPromise);
  return loadPromise;
}

export async function getRecipeListVersion(): Promise<number> {
  const cachedVersion = await getCachedValue<number>(
    cacheKeys.recipeListVersion,
  );
  return typeof cachedVersion === 'number' ? cachedVersion : 1;
}

export interface CacheInvalidationScope {
  recipeId?: string;
  recipeIds?: string[];
  slugs?: Array<string | null | undefined>;
  authorId?: string;
  authorIds?: string[];
  favoriteUserId?: string;
  followerUserId?: string;
  sessionUserId?: string;
  /** Clears every per-user cache entry (recipes, favorites, following, session version). */
  userIds?: string[];
  metadataActive?: boolean;
  invalidateRecipeLists?: boolean;
}

export async function invalidateCacheScope(
  scope: CacheInvalidationScope,
): Promise<void> {
  const currentRedis = redis;
  if (!currentRedis) return;

  const keysToDelete = new Set<string>();

  const addRecipeKeys = (recipeId: string) => {
    keysToDelete.add(cacheKeys.recipeDetail(recipeId));
    keysToDelete.add(cacheKeys.recipeLookup(recipeId));
  };

  if (scope.recipeId) {
    addRecipeKeys(scope.recipeId);
  }

  for (const recipeId of scope.recipeIds ?? []) {
    addRecipeKeys(recipeId);
  }

  for (const slug of scope.slugs ?? []) {
    if (slug) {
      keysToDelete.add(cacheKeys.recipeLookup(slug));
    }
  }

  if (scope.authorId) {
    keysToDelete.add(cacheKeys.userRecipes(scope.authorId, undefined));
  }

  for (const authorId of scope.authorIds ?? []) {
    keysToDelete.add(cacheKeys.userRecipes(authorId, undefined));
  }

  if (scope.favoriteUserId) {
    keysToDelete.add(cacheKeys.userFavorites(scope.favoriteUserId, undefined));
  }

  if (scope.followerUserId) {
    keysToDelete.add(cacheKeys.userFollowing(scope.followerUserId, undefined));
  }

  if (scope.sessionUserId) {
    keysToDelete.add(cacheKeys.sessionVersion(scope.sessionUserId));
  }

  for (const userId of scope.userIds ?? []) {
    keysToDelete.add(cacheKeys.userRecipes(userId, undefined));
    keysToDelete.add(cacheKeys.userFavorites(userId, undefined));
    keysToDelete.add(cacheKeys.userFollowing(userId, undefined));
    keysToDelete.add(cacheKeys.sessionVersion(userId));
  }

  if (scope.metadataActive) {
    keysToDelete.add(cacheKeys.metadataActive);
  }

  try {
    const keys = [...keysToDelete];
    for (let start = 0; start < keys.length; start += KEY_DELETE_BATCH_SIZE) {
      await Promise.all(
        keys
          .slice(start, start + KEY_DELETE_BATCH_SIZE)
          .map((key) => currentRedis.del(key)),
      );
    }

    if (scope.invalidateRecipeLists && currentRedis.incr) {
      await currentRedis.incr(cacheKeys.recipeListVersion);
    }
  } catch (error) {
    logger.warn({ err: error }, 'Redis cache invalidation error');
  }
}
