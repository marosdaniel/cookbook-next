import { err, ok, type Result, ResultAsync } from 'neverthrow';

export { err, ok, type Result, ResultAsync };

export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'BAD_REQUEST'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export interface DomainError {
  code: DomainErrorCode;
  reason: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface DomainSuccess<T = void> {
  reason: string;
  message: string;
  statusCode: number;
  data?: T;
}

const DEFAULT_STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export const createDomainError = (
  code: DomainErrorCode,
  reason: string,
  message: string,
  statusCode: number = DEFAULT_STATUS_BY_CODE[code],
  details?: Record<string, unknown>,
): DomainError => ({
  code,
  reason,
  message,
  statusCode,
  ...(details ? { details } : {}),
});

export const domainNotFound = (reason: string, message: string): DomainError =>
  createDomainError('NOT_FOUND', reason, message, 404);

export const domainForbidden = (reason: string, message: string): DomainError =>
  createDomainError('FORBIDDEN', reason, message, 403);

export const domainConflict = (reason: string, message: string): DomainError =>
  createDomainError('CONFLICT', reason, message, 409);

export const domainBadRequest = (
  reason: string,
  message: string,
): DomainError => createDomainError('BAD_REQUEST', reason, message, 400);

export const domainValidation = (
  reason: string,
  message: string,
  details?: Record<string, unknown>,
): DomainError =>
  createDomainError('VALIDATION', reason, message, 400, details);

export const domainRateLimited = (
  reason: string,
  message: string,
): DomainError => createDomainError('RATE_LIMITED', reason, message, 429);

export const domainInternal = (reason: string, message: string): DomainError =>
  createDomainError('INTERNAL', reason, message, 500);
