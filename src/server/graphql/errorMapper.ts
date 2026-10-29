import { GraphQLError } from 'graphql';
import {
  USER_FAVORITE_MESSAGE_KEYS,
  USER_FOLLOW_MESSAGE_KEYS,
} from '@/lib/graphql/MESSAGE_KEYS';
import type {
  DomainError,
  DomainSuccess,
  Result,
} from '@/server/platform/errors';
import type { OperationResponse } from '@/types/graphql/responses';

const GRAPHQL_ERROR_CODE_MAP: Record<DomainError['code'], string> = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION: 'BAD_USER_INPUT',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
};

export const toGraphQLError = (
  error: DomainError,
  messageKey?: string,
): GraphQLError =>
  new GraphQLError(error.message, {
    extensions: {
      code: GRAPHQL_ERROR_CODE_MAP[error.code],
      http: { status: error.statusCode },
      ...(messageKey ? { messageKey } : {}),
      ...(error.details ? { details: error.details } : {}),
    },
  });

const FAVORITE_REASON_TO_MESSAGE_KEY: Record<string, string> = {
  SUCCESS: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
  UNAUTHORIZED: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
  USER_NOT_FOUND: USER_FAVORITE_MESSAGE_KEYS.USER_NOT_FOUND,
  RECIPE_NOT_FOUND: USER_FAVORITE_MESSAGE_KEYS.RECIPE_NOT_FOUND,
  ALREADY_FAVORITE: USER_FAVORITE_MESSAGE_KEYS.ALREADY_FAVORITE,
  NOT_IN_FAVORITES: USER_FAVORITE_MESSAGE_KEYS.NOT_IN_FAVORITES,
};

const FOLLOW_REASON_TO_MESSAGE_KEY: Record<string, string> = {
  FOLLOW_SUCCESS: USER_FOLLOW_MESSAGE_KEYS.FOLLOW_SUCCESS,
  UNFOLLOW_SUCCESS: USER_FOLLOW_MESSAGE_KEYS.UNFOLLOW_SUCCESS,
  UNAUTHORIZED: USER_FOLLOW_MESSAGE_KEYS.UNAUTHORIZED,
  USER_NOT_FOUND: USER_FOLLOW_MESSAGE_KEYS.USER_NOT_FOUND,
  CANNOT_FOLLOW_SELF: USER_FOLLOW_MESSAGE_KEYS.CANNOT_FOLLOW_SELF,
  ALREADY_FOLLOWING: USER_FOLLOW_MESSAGE_KEYS.ALREADY_FOLLOWING,
  NOT_FOLLOWING: USER_FOLLOW_MESSAGE_KEYS.NOT_FOLLOWING,
};

const isResultLike = (
  value: unknown,
): value is Result<DomainSuccess, DomainError> =>
  typeof value === 'object' &&
  value !== null &&
  'isOk' in value &&
  typeof (value as { isOk: unknown }).isOk === 'function';

export const mapDomainResultToOperationResponse = (
  result: Result<DomainSuccess, DomainError> | OperationResponse,
  reasonMap: Record<string, string>,
  fallbackErrorKey: string,
): OperationResponse => {
  if (!isResultLike(result)) {
    return result;
  }

  if (result.isOk()) {
    const val = result.value;
    return {
      success: true,
      message: val.message,
      messageKey: reasonMap[val.reason] ?? fallbackErrorKey,
      statusCode: val.statusCode,
    };
  }

  const error = result.error;
  return {
    success: false,
    message: error.message,
    messageKey: reasonMap[error.reason] ?? fallbackErrorKey,
    statusCode: error.statusCode,
  };
};

export const mapFavoriteResult = (
  result: Result<DomainSuccess, DomainError> | OperationResponse,
): OperationResponse =>
  mapDomainResultToOperationResponse(
    result,
    FAVORITE_REASON_TO_MESSAGE_KEY,
    USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
  );

export const mapFollowResult = (
  result: Result<DomainSuccess, DomainError> | OperationResponse,
): OperationResponse =>
  mapDomainResultToOperationResponse(
    result,
    FOLLOW_REASON_TO_MESSAGE_KEY,
    USER_FOLLOW_MESSAGE_KEYS.UNAUTHORIZED,
  );
