import { describe, expect, it } from 'vitest';
import {
  USER_FAVORITE_MESSAGE_KEYS,
  USER_FOLLOW_MESSAGE_KEYS,
} from '@/lib/graphql/MESSAGE_KEYS';
import {
  createDomainError,
  type DomainError,
  type DomainErrorCode,
  err,
  ok,
} from '@/server/platform/errors';
import {
  mapDomainResultToOperationResponse,
  mapFavoriteResult,
  mapFollowResult,
  toGraphQLError,
} from './errorMapper';

const CODE_TO_GRAPHQL: Array<[DomainErrorCode, string]> = [
  ['BAD_REQUEST', 'BAD_REQUEST'],
  ['VALIDATION', 'BAD_USER_INPUT'],
  ['FORBIDDEN', 'FORBIDDEN'],
  ['NOT_FOUND', 'NOT_FOUND'],
  ['CONFLICT', 'CONFLICT'],
  ['RATE_LIMITED', 'RATE_LIMITED'],
  ['INTERNAL', 'INTERNAL_SERVER_ERROR'],
];

describe('toGraphQLError', () => {
  it.each(CODE_TO_GRAPHQL)(
    'maps domain code %s to GraphQL code %s',
    (domainCode, graphqlCode) => {
      const error = createDomainError(domainCode, 'reason', 'msg');

      expect(toGraphQLError(error).extensions).toMatchObject({
        code: graphqlCode,
        http: { status: error.statusCode },
      });
    },
  );

  it('includes messageKey and details when provided', () => {
    const error = createDomainError('VALIDATION', 'reason', 'msg', 400, {
      field: 'name',
    });

    const gqlError = toGraphQLError(error, 'some.key');

    expect(gqlError.message).toBe('msg');
    expect(gqlError.extensions).toMatchObject({
      messageKey: 'some.key',
      details: { field: 'name' },
    });
  });

  it('omits messageKey and details when they are not provided', () => {
    const gqlError = toGraphQLError(
      createDomainError('NOT_FOUND', 'reason', 'missing'),
    );

    expect(gqlError.extensions).not.toHaveProperty('messageKey');
    expect(gqlError.extensions).not.toHaveProperty('details');
  });
});

describe('mapDomainResultToOperationResponse', () => {
  const reasonMap = { FOUND: 'found.key' };

  it('maps an ok result using the reason map', () => {
    expect(
      mapDomainResultToOperationResponse(
        ok({ reason: 'FOUND', message: 'Found', statusCode: 200 }),
        reasonMap,
        'fallback.key',
      ),
    ).toEqual({
      success: true,
      message: 'Found',
      messageKey: 'found.key',
      statusCode: 200,
    });
  });

  it('maps an error result using the reason map', () => {
    const error: DomainError = createDomainError(
      'NOT_FOUND',
      'FOUND',
      'Nope',
      404,
    );

    expect(
      mapDomainResultToOperationResponse(err(error), reasonMap, 'fallback.key'),
    ).toEqual({
      success: false,
      message: 'Nope',
      messageKey: 'found.key',
      statusCode: 404,
    });
  });

  it('uses the fallback key for unknown reasons', () => {
    expect(
      mapDomainResultToOperationResponse(
        ok({ reason: 'UNKNOWN', message: 'm', statusCode: 200 }),
        reasonMap,
        'fallback.key',
      ),
    ).toMatchObject({ messageKey: 'fallback.key' });

    expect(
      mapDomainResultToOperationResponse(
        err(createDomainError('INTERNAL', 'UNKNOWN', 'm')),
        reasonMap,
        'fallback.key',
      ),
    ).toMatchObject({ messageKey: 'fallback.key' });
  });

  it('returns an already-mapped OperationResponse unchanged', () => {
    const response = {
      success: true,
      message: 'done',
      messageKey: 'k',
      statusCode: 200,
    };

    expect(
      mapDomainResultToOperationResponse(response, reasonMap, 'fallback.key'),
    ).toBe(response);
  });
});

describe('mapFavoriteResult', () => {
  it('maps favorite success reasons to their message keys', () => {
    expect(
      mapFavoriteResult(
        ok({ reason: 'ALREADY_FAVORITE', message: 'm', statusCode: 200 }),
      ),
    ).toMatchObject({
      messageKey: USER_FAVORITE_MESSAGE_KEYS.ALREADY_FAVORITE,
    });
  });

  it('maps favorite error reasons and falls back to UNAUTHORIZED', () => {
    expect(
      mapFavoriteResult(
        err(createDomainError('NOT_FOUND', 'RECIPE_NOT_FOUND', 'm')),
      ),
    ).toMatchObject({
      messageKey: USER_FAVORITE_MESSAGE_KEYS.RECIPE_NOT_FOUND,
      success: false,
    });

    expect(
      mapFavoriteResult(err(createDomainError('INTERNAL', 'OTHER', 'm'))),
    ).toMatchObject({ messageKey: USER_FAVORITE_MESSAGE_KEYS.UNAUTHORIZED });
  });
});

describe('mapFollowResult', () => {
  it('maps follow success reasons to their message keys', () => {
    expect(
      mapFollowResult(
        ok({ reason: 'UNFOLLOW_SUCCESS', message: 'm', statusCode: 200 }),
      ),
    ).toMatchObject({
      messageKey: USER_FOLLOW_MESSAGE_KEYS.UNFOLLOW_SUCCESS,
      success: true,
    });
  });

  it('maps follow error reasons and falls back to UNAUTHORIZED', () => {
    expect(
      mapFollowResult(
        err(createDomainError('BAD_REQUEST', 'CANNOT_FOLLOW_SELF', 'm')),
      ),
    ).toMatchObject({
      messageKey: USER_FOLLOW_MESSAGE_KEYS.CANNOT_FOLLOW_SELF,
      success: false,
    });

    expect(
      mapFollowResult(err(createDomainError('INTERNAL', 'OTHER', 'm'))),
    ).toMatchObject({ messageKey: USER_FOLLOW_MESSAGE_KEYS.UNAUTHORIZED });
  });
});
