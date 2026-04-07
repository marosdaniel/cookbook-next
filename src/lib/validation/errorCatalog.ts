import type { ErrorCatalog } from './types';

export const ErrorTypes: ErrorCatalog = {
  BAD_REQUEST: {
    errorCode: 'BAD_REQUEST',
    errorStatus: 400,
  },
  VALIDATION_ERROR: {
    errorCode: 'VALIDATION_ERROR',
    errorStatus: 400,
  },
  UNAUTHORIZED: {
    errorCode: 'UNAUTHORIZED',
    errorStatus: 401,
  },
  FORBIDDEN: {
    errorCode: 'FORBIDDEN',
    errorStatus: 403,
  },
  NOT_FOUND: {
    errorCode: 'NOT_FOUND',
    errorStatus: 404,
  },
  CONFLICT: {
    errorCode: 'CONFLICT', // e.g. email already exists
    errorStatus: 409, // 409 Conflict is the correct HTTP code for duplicates
  },
  INTERNAL_SERVER_ERROR: {
    errorCode: 'INTERNAL_SERVER_ERROR',
    errorStatus: 500,
  },
} as const;
