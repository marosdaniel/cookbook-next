/**
 * Minimal interface to represent a Zod issue.
 * We use this to avoid the deprecated 'ZodIssue' type name while maintaining
 * the needed structure for error reporting.
 */
export interface ZodIssueMinimal {
  path: (string | number | symbol)[];
  message: string;
}

export interface ErrorOptions {
  messageKey?: string;
  originalError?: unknown;
  details?: Record<string, unknown>;
  zodIssues?: ZodIssueMinimal[];
}

export type FormLike = {
  errors: Record<string, unknown>;
  isDirty: (path?: string) => boolean;
  isValid: () => boolean | Promise<boolean>;
};

export type ErrorTypeDefinition = {
  errorCode: ErrorTypeKey;
  errorStatus: number;
};

export type ErrorTypeKey =
  | 'BAD_REQUEST'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

export type ErrorCatalog = Record<ErrorTypeKey, ErrorTypeDefinition>;
