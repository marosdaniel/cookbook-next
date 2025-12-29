import { GraphQLError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { ErrorTypes } from './errorCatalog';
import { throwCustomError } from './throwCustomError';

describe('throwCustomError', () => {
  it('should throw a GraphQLError with correct basic properties', () => {
    const message = 'Test error';
    const errorType = ErrorTypes.BAD_REQUEST;

    try {
      throwCustomError(message, errorType);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      const gqlError = error as GraphQLError;
      expect(gqlError.message).toBe(message);
      expect(gqlError.extensions.code).toBe(errorType.errorCode);
      expect(gqlError.extensions.http).toEqual({
        status: errorType.errorStatus,
      });
    }
  });

  it('should include messageKey if provided', () => {
    const options = { messageKey: 'CUSTOM_KEY' };
    try {
      throwCustomError('msg', ErrorTypes.NOT_FOUND, options);
    } catch (error) {
      const gqlError = error as GraphQLError;
      expect(gqlError.extensions.messageKey).toBe('CUSTOM_KEY');
    }
  });

  it('should include details if provided', () => {
    const details = { field: 'error' };
    try {
      throwCustomError('msg', ErrorTypes.VALIDATION_ERROR, { details });
    } catch (error) {
      const gqlError = error as GraphQLError;
      expect(gqlError.extensions.details).toEqual(details);
    }
  });

  it('should convert zodIssues to fieldErrors', () => {
    const zodIssues = [
      { path: ['email'], message: 'Invalid email' },
      { path: ['password'], message: 'Too short' },
      { path: ['nested', 'field'], message: 'Deep error' },
    ];

    try {
      throwCustomError('Validation failed', ErrorTypes.VALIDATION_ERROR, {
        zodIssues,
      });
    } catch (error) {
      const gqlError = error as GraphQLError;
      expect(gqlError.extensions.details).toEqual({
        email: ['Invalid email'],
        password: ['Too short'],
        'nested.field': ['Deep error'],
      });
    }
  });

  it('should handle zodIssues without path', () => {
    const zodIssues = [{ path: [], message: 'Root error' }];

    try {
      throwCustomError('err', ErrorTypes.VALIDATION_ERROR, { zodIssues });
    } catch (error) {
      const gqlError = error as GraphQLError;
      expect(gqlError.extensions.details).toEqual({
        _root: ['Root error'],
      });
    }
  });

  it('should include originalError if provided', () => {
    const original = new Error('Original');
    try {
      throwCustomError('msg', ErrorTypes.INTERNAL_SERVER_ERROR, {
        originalError: original,
      });
    } catch (error) {
      // Note: originalError is passed as second argument to GraphQLError constructor
      // which sets it on the error object.
      expect(error).toHaveProperty('originalError', original);
    }
  });
});
