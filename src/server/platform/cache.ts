import { cacheKeys } from '@/lib/cache/cacheKeys';
import { redis } from '@/lib/redis/redis';

export { cacheKeys };

export const LIST_CACHE_TTL_SECONDS = 15;
export const DETAIL_CACHE_TTL_SECONDS = 60;
export const SESSION_VERSION_CACHE_TTL_SECONDS = 60;

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
    console.warn('Redis cache get error:', error);
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
    console.warn('Redis cache set error:', error);
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
  slugs?: Array<string | null | undefined>;
  authorId?: string;
  favoriteUserId?: string;
  followerUserId?: string;
  sessionUserId?: string;
  metadataActive?: boolean;
  invalidateRecipeLists?: boolean;
}

export async function invalidateCacheScope(
  scope: CacheInvalidationScope,
): Promise<void> {
  const currentRedis = redis;
  if (!currentRedis) return;

  const keysToDelete = new Set<string>();

  if (scope.recipeId) {
    keysToDelete.add(cacheKeys.recipeDetail(scope.recipeId));
    keysToDelete.add(cacheKeys.recipeLookup(scope.recipeId));
  }

  for (const slug of scope.slugs ?? []) {
    if (slug) {
      keysToDelete.add(cacheKeys.recipeLookup(slug));
    }
  }

  if (scope.authorId) {
    keysToDelete.add(cacheKeys.userRecipes(scope.authorId, undefined));
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

  if (scope.metadataActive) {
    keysToDelete.add(cacheKeys.metadataActive);
  }

  try {
    const operations: Promise<unknown>[] = [
      ...[...keysToDelete].map((key) => currentRedis.del(key)),
    ];

    if (scope.invalidateRecipeLists && currentRedis.incr) {
      operations.push(currentRedis.incr(cacheKeys.recipeListVersion));
    }

    if (operations.length > 0) {
      await Promise.all(operations);
    }
  } catch (error) {
    console.warn('Redis cache invalidation error:', error);
  }
}
