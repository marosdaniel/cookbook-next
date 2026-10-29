import crypto from 'node:crypto';
import { type Duration, Ratelimit } from '@upstash/ratelimit';
import { env } from '@/env';
import {
  type GraphQLOperationName,
  normalizeGraphQLOperationName,
  OPERATION_NAMES,
} from '@/lib/graphql/operations';
import * as redisModule from '@/lib/redis/redis';

export type RateLimitGroupName =
  | 'auth-sensitive'
  | 'password-change'
  | 'content-write'
  | 'rating'
  | 'admin'
  | 'global';

export type RateLimitKeyStrategy = 'ip' | 'user';

export interface RateLimitCheckResult {
  success: boolean;
  limit: number;
  remaining: number;
}

export interface SimpleRateLimiter {
  limit: (key: string) => Promise<RateLimitCheckResult>;
}

export type RateLimitOperation = Extract<
  GraphQLOperationName,
  | typeof OPERATION_NAMES.RESET_PASSWORD
  | typeof OPERATION_NAMES.SET_NEW_PASSWORD
  | typeof OPERATION_NAMES.CREATE_USER
  | typeof OPERATION_NAMES.CHANGE_PASSWORD
  | typeof OPERATION_NAMES.CREATE_RECIPE
  | typeof OPERATION_NAMES.EDIT_RECIPE
  | typeof OPERATION_NAMES.DELETE_RECIPE
  | typeof OPERATION_NAMES.RATE_RECIPE
  | typeof OPERATION_NAMES.DELETE_RATING
  | typeof OPERATION_NAMES.GET_RECIPES
  | typeof OPERATION_NAMES.CREATE_METADATA
  | typeof OPERATION_NAMES.UPDATE_METADATA
  | typeof OPERATION_NAMES.SET_METADATA_ACTIVE
  | typeof OPERATION_NAMES.REORDER_METADATA
  | typeof OPERATION_NAMES.DELETE_ALL_USER
  | typeof OPERATION_NAMES.DELETE_ALL_RECIPES
>;

export const RATE_LIMIT_REDIS_TIMEOUT_MS = 750;

export const createInMemoryLimiter = (
  maxRequests: number,
  windowMs: number,
): SimpleRateLimiter => {
  const buckets = new Map<string, number[]>();

  return {
    limit(key: string): Promise<RateLimitCheckResult> {
      const now = Date.now();
      const cutoff = now - windowMs;
      const existing = buckets.get(key) ?? [];
      const active = existing.filter((timestamp) => timestamp > cutoff);

      if (active.length >= maxRequests) {
        buckets.set(key, active);
        return Promise.resolve({
          success: false,
          limit: maxRequests,
          remaining: 0,
        });
      }

      active.push(now);
      buckets.set(key, active);

      if (buckets.size > 5_000) {
        for (const [k, timestamps] of buckets) {
          if (timestamps.every((ts) => ts <= cutoff)) {
            buckets.delete(k);
          }
        }
      }

      return Promise.resolve({
        success: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - active.length),
      });
    },
  };
};

const isAnalyticsEnabled = () => env.UPSTASH_RATELIMIT_ANALYTICS === 'true';

const getRawRedisClient = () =>
  'rawRedisClient' in redisModule ? redisModule.rawRedisClient : null;

export const createLimiter = (
  prefix: string,
  window: Duration,
  requests: number,
) => {
  const client = getRawRedisClient();
  if (!client) {
    return null;
  }

  try {
    return new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: isAnalyticsEnabled(),
      prefix,
    });
  } catch (error) {
    console.warn(`Rate limiter initialization failed for ${prefix}.`, error);
    return null;
  }
};

// Default global rate limiter: 100 requests per 60 seconds per IP
export const rateLimiter = createLimiter('ratelimit:graphql', '60 s', 100);
export const fallbackGlobalRateLimiter = createInMemoryLimiter(100, 60_000);

// Group limiters
export const authSensitiveRateLimiter = createLimiter(
  'ratelimit:graphql:auth-sensitive',
  '10 m',
  5,
);
export const fallbackAuthSensitiveRateLimiter = createInMemoryLimiter(
  5,
  10 * 60_000,
);

export const passwordChangeRateLimiter = createLimiter(
  'ratelimit:graphql:password-change',
  '10 m',
  5,
);
export const fallbackPasswordChangeRateLimiter = createInMemoryLimiter(
  5,
  10 * 60_000,
);

export const contentWriteRateLimiter = createLimiter(
  'ratelimit:graphql:content-write',
  '10 m',
  30,
);
export const fallbackContentWriteRateLimiter = createInMemoryLimiter(
  30,
  10 * 60_000,
);

export const ratingRateLimiter = createLimiter(
  'ratelimit:graphql:rating',
  '10 m',
  60,
);
export const fallbackRatingRateLimiter = createInMemoryLimiter(60, 10 * 60_000);

export const adminRateLimiter = createLimiter(
  'ratelimit:graphql:admin',
  '10 m',
  60,
);
export const fallbackAdminRateLimiter = createInMemoryLimiter(60, 10 * 60_000);

// Backward-compatible export alias for auth-sensitive strict limiter
export const strictRateLimiter = authSensitiveRateLimiter;

// Password reset email limiter: 3 requests per hour per email hash
export const passwordResetEmailRateLimiter = createLimiter(
  'ratelimit:auth:reset-email',
  '60 m',
  3,
);
export const fallbackPasswordResetEmailRateLimiter = createInMemoryLimiter(
  3,
  60 * 60_000,
);

export const hashRateLimitIdentifier = (value: string): string =>
  crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

export const executeRateLimitWithFallback = async (
  primaryLimiter: SimpleRateLimiter | null,
  fallbackLimiter: SimpleRateLimiter,
  key: string,
  timeoutMs: number = RATE_LIMIT_REDIS_TIMEOUT_MS,
): Promise<RateLimitCheckResult> => {
  if (!primaryLimiter) {
    return fallbackLimiter.limit(key);
  }

  try {
    const runWithTimeout =
      'withTimeout' in redisModule
        ? redisModule.withTimeout
        : <T>(op: () => Promise<T>) => op();
    const result = await runWithTimeout(
      () => primaryLimiter.limit(key),
      timeoutMs,
    );
    if (!result) {
      return fallbackLimiter.limit(key);
    }
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
    };
  } catch (error) {
    console.warn(
      'Primary rate limiter failed; using in-memory fallback.',
      error,
    );
    return fallbackLimiter.limit(key);
  }
};

export const checkPasswordResetEmailRateLimit = async (
  email: string,
): Promise<RateLimitCheckResult> => {
  const emailHash = hashRateLimitIdentifier(email);
  return executeRateLimitWithFallback(
    passwordResetEmailRateLimiter,
    fallbackPasswordResetEmailRateLimiter,
    emailHash,
  );
};

const AUTH_SENSITIVE_OPERATIONS: ReadonlySet<string> = new Set([
  OPERATION_NAMES.RESET_PASSWORD,
  OPERATION_NAMES.SET_NEW_PASSWORD,
  OPERATION_NAMES.CREATE_USER,
]);

const PASSWORD_CHANGE_OPERATIONS: ReadonlySet<string> = new Set([
  OPERATION_NAMES.CHANGE_PASSWORD,
]);

const CONTENT_WRITE_OPERATIONS: ReadonlySet<string> = new Set([
  OPERATION_NAMES.CREATE_RECIPE,
  OPERATION_NAMES.EDIT_RECIPE,
  OPERATION_NAMES.DELETE_RECIPE,
]);

const RATING_OPERATIONS: ReadonlySet<string> = new Set([
  OPERATION_NAMES.RATE_RECIPE,
  OPERATION_NAMES.DELETE_RATING,
]);

const ADMIN_OPERATIONS: ReadonlySet<string> = new Set([
  OPERATION_NAMES.CREATE_METADATA,
  OPERATION_NAMES.UPDATE_METADATA,
  OPERATION_NAMES.SET_METADATA_ACTIVE,
  OPERATION_NAMES.REORDER_METADATA,
  OPERATION_NAMES.DELETE_ALL_USER,
  OPERATION_NAMES.DELETE_ALL_RECIPES,
]);

export interface RateLimitGroupConfig {
  group: RateLimitGroupName;
  keyStrategy: RateLimitKeyStrategy;
  limiter: SimpleRateLimiter | null;
  fallbackLimiter: SimpleRateLimiter;
}

export const getRateLimitGroupForField = (
  fieldName: string | undefined,
): RateLimitGroupConfig | null => {
  const normalized = normalizeGraphQLOperationName(fieldName);
  if (!normalized) {
    return null;
  }

  if (AUTH_SENSITIVE_OPERATIONS.has(normalized)) {
    return {
      group: 'auth-sensitive',
      keyStrategy: 'ip',
      limiter: authSensitiveRateLimiter,
      fallbackLimiter: fallbackAuthSensitiveRateLimiter,
    };
  }

  if (PASSWORD_CHANGE_OPERATIONS.has(normalized)) {
    return {
      group: 'password-change',
      keyStrategy: 'user',
      limiter: passwordChangeRateLimiter,
      fallbackLimiter: fallbackPasswordChangeRateLimiter,
    };
  }

  if (CONTENT_WRITE_OPERATIONS.has(normalized)) {
    return {
      group: 'content-write',
      keyStrategy: 'user',
      limiter: contentWriteRateLimiter,
      fallbackLimiter: fallbackContentWriteRateLimiter,
    };
  }

  if (RATING_OPERATIONS.has(normalized)) {
    return {
      group: 'rating',
      keyStrategy: 'user',
      limiter: ratingRateLimiter,
      fallbackLimiter: fallbackRatingRateLimiter,
    };
  }

  if (ADMIN_OPERATIONS.has(normalized)) {
    return {
      group: 'admin',
      keyStrategy: 'user',
      limiter: adminRateLimiter,
      fallbackLimiter: fallbackAdminRateLimiter,
    };
  }

  return null;
};

export const isStrictRateLimitOperation = (
  operationName: string | undefined,
): operationName is Exclude<
  RateLimitOperation,
  typeof OPERATION_NAMES.GET_RECIPES
> => {
  return getRateLimitGroupForField(operationName) !== null;
};

export const isRateLimitOperation = (
  operationName: string | undefined,
): operationName is RateLimitOperation => {
  const normalizedOperationName = normalizeGraphQLOperationName(operationName);

  return (
    normalizedOperationName === OPERATION_NAMES.GET_RECIPES ||
    isStrictRateLimitOperation(normalizedOperationName)
  );
};

export const getRateLimiterForOperation = (operation: RateLimitOperation) => {
  const groupConfig = getRateLimitGroupForField(operation);
  if (groupConfig) {
    return groupConfig.limiter;
  }

  return rateLimiter;
};
