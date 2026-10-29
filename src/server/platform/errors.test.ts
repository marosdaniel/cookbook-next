import { describe, expect, it } from 'vitest';
import {
  USER_FAVORITE_MESSAGE_KEYS,
  USER_FOLLOW_MESSAGE_KEYS,
} from '@/lib/graphql/MESSAGE_KEYS';
import {
  mapFavoriteResult,
  mapFollowResult,
  toGraphQLError,
} from '@/server/graphql/errorMapper';
import {
  domainBadRequest,
  domainConflict,
  domainForbidden,
  domainNotFound,
  err,
  ok,
} from './errors';

describe('domain errors and GraphQL error mapping', () => {
  it('maps ok and err favorite results to OperationResponse with expected message keys', () => {
    const okRes = mapFavoriteResult(
      ok({
        reason: 'SUCCESS',
        message: 'Recipe successfully added to favorites',
        statusCode: 200,
      }),
    );

    expect(okRes).toEqual({
      success: true,
      message: 'Recipe successfully added to favorites',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.SUCCESS,
      statusCode: 200,
    });

    const errRes = mapFavoriteResult(
      err(
        domainForbidden(
          'UNAUTHORIZED',
          'Unauthorized operation - insufficient permissions',
        ),
      ),
    );

    expect(errRes).toEqual({
      success: false,
      message: 'Unauthorized operation - insufficient permissions',
      messageKey: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED,
      statusCode: 403,
    });
  });

  it('maps follow and unfollow domain errors to expected status codes and keys', () => {
    const selfFollowErr = mapFollowResult(
      err(domainBadRequest('CANNOT_FOLLOW_SELF', 'You cannot follow yourself')),
    );

    expect(selfFollowErr).toEqual({
      success: false,
      message: 'You cannot follow yourself',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.CANNOT_FOLLOW_SELF,
      statusCode: 400,
    });

    const missingUserErr = mapFollowResult(
      err(domainNotFound('USER_NOT_FOUND', 'User not found')),
    );

    expect(missingUserErr).toEqual({
      success: false,
      message: 'User not found',
      messageKey: USER_FOLLOW_MESSAGE_KEYS.USER_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('converts DomainError into GraphQLError with extensions', () => {
    const gqlErr = toGraphQLError(
      domainConflict('USERNAME_TAKEN', 'This username is already taken'),
      'response.userRegisterUsernameTaken',
    );

    expect(gqlErr.message).toBe('This username is already taken');
    expect(gqlErr.extensions).toMatchObject({
      code: 'CONFLICT',
      messageKey: 'response.userRegisterUsernameTaken',
      http: { status: 409 },
    });
  });
});
