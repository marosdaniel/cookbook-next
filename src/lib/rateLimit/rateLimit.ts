import { type Duration, Ratelimit } from '@upstash/ratelimit';
import {
  type GraphQLOperationName,
  OPERATION_NAMES,
} from '@/lib/graphql/operations';
import { rawRedisClient } from '@/lib/redis/redis';

export type RateLimitOperation = Extract<
  GraphQLOperationName,
  | typeof OPERATION_NAMES.RESET_PASSWORD
  | typeof OPERATION_NAMES.CREATE_RECIPE
  | typeof OPERATION_NAMES.EDIT_RECIPE
  | typeof OPERATION_NAMES.DELETE_RECIPE
  | typeof OPERATION_NAMES.RATE_RECIPE
  | typeof OPERATION_NAMES.DELETE_RATING
  | typeof OPERATION_NAMES.GET_RECIPES
>;

const createLimiter = (prefix: string, window: Duration, requests: number) => {
  if (!rawRedisClient) {
    return null;
  }

  try {
    return new Ratelimit({
      redis: rawRedisClient,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix,
    });
  } catch (error) {
    console.warn(`Rate limiter initialization failed for ${prefix}.`, error);
    return null;
  }
};

const shouldUseLimiter = Boolean(rawRedisClient);

// Default global rate limiter: 100 requests per 60 seconds per IP
export const rateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql', '60 s', 100)
  : null;

// More strict rate limiter for sensitive operations (e.g., reset password)
// 5 requests per 10 minutes
export const strictRateLimiter = shouldUseLimiter
  ? createLimiter('ratelimit:graphql:strict', '10 m', 5)
  : null;

export const isRateLimitOperation = (
  operationName: string | undefined,
): operationName is RateLimitOperation => {
  return (
    operationName === OPERATION_NAMES.RESET_PASSWORD ||
    operationName === OPERATION_NAMES.CREATE_RECIPE ||
    operationName === OPERATION_NAMES.EDIT_RECIPE ||
    operationName === OPERATION_NAMES.DELETE_RECIPE ||
    operationName === OPERATION_NAMES.RATE_RECIPE ||
    operationName === OPERATION_NAMES.DELETE_RATING ||
    operationName === OPERATION_NAMES.GET_RECIPES
  );
};

export const isStrictRateLimitOperation = (
  operationName: string | undefined,
): operationName is Exclude<
  RateLimitOperation,
  typeof OPERATION_NAMES.GET_RECIPES
> => {
  return (
    operationName === OPERATION_NAMES.RESET_PASSWORD ||
    operationName === OPERATION_NAMES.CREATE_RECIPE ||
    operationName === OPERATION_NAMES.EDIT_RECIPE ||
    operationName === OPERATION_NAMES.DELETE_RECIPE ||
    operationName === OPERATION_NAMES.RATE_RECIPE ||
    operationName === OPERATION_NAMES.DELETE_RATING
  );
};

export const getRateLimiterForOperation = (operation: RateLimitOperation) => {
  if (isStrictRateLimitOperation(operation)) {
    return strictRateLimiter;
  }

  return rateLimiter;
};
