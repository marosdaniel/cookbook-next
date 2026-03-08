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
