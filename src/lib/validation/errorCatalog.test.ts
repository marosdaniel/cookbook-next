import { describe, expect, it } from 'vitest';
import { ErrorTypes } from './errorCatalog';

describe('ErrorTypes', () => {
  it('should have BAD_REQUEST with code 400', () => {
    expect(ErrorTypes.BAD_REQUEST).toEqual({
      errorCode: 'BAD_REQUEST',
      errorStatus: 400,
    });
  });

  it('should have UNAUTHORIZED with code 401', () => {
    expect(ErrorTypes.UNAUTHORIZED).toEqual({
      errorCode: 'UNAUTHORIZED',
      errorStatus: 401,
    });
  });

  it('should have NOT_FOUND with code 404', () => {
    expect(ErrorTypes.NOT_FOUND).toEqual({
      errorCode: 'NOT_FOUND',
      errorStatus: 404,
    });
  });

  it('should have CONFLICT with code 409', () => {
    expect(ErrorTypes.CONFLICT).toEqual({
      errorCode: 'CONFLICT',
      errorStatus: 409,
    });
  });

  it('should have INTERNAL_SERVER_ERROR with code 500', () => {
    expect(ErrorTypes.INTERNAL_SERVER_ERROR).toEqual({
      errorCode: 'INTERNAL_SERVER_ERROR',
      errorStatus: 500,
    });
  });
});
