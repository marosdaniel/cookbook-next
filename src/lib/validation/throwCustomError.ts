import { GraphQLError } from 'graphql';
import type { ErrorTypeDefinition } from './errorCatalog';

interface ErrorOptions {
  messageKey?: string;
  originalError?: unknown;
  details?: Record<string, any>;
  zodIssues?: Array<{ path: (string | number)[]; message: string }>;
}

const buildFieldErrorsFromZodIssues = (
  issues: Array<{ path: (string | number)[]; message: string }>,
) => {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of issues) {
    const path = issue.path.join('.') || '_root';
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
};

export const throwCustomError = (
  message: string,
  errorType: ErrorTypeDefinition,
  options?: ErrorOptions,
): never => {
  const zodDetails = options?.zodIssues
    ? buildFieldErrorsFromZodIssues(options.zodIssues)
    : undefined;

  throw new GraphQLError(message, {
    extensions: {
      code: errorType.errorCode,
      messageKey: options?.messageKey ?? null,
      http: {
        status: errorType.errorStatus,
      },
      details: zodDetails ?? options?.details ?? null,
      stacktrace: process.env.NODE_ENV === 'development' ? undefined : null,
    },
    originalError:
      options?.originalError instanceof Error
        ? options.originalError
        : undefined,
  });
};
