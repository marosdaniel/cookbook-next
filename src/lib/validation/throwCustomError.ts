import { GraphQLError } from 'graphql';
import type {
  ErrorOptions,
  ErrorTypeDefinition,
  ZodIssueMinimal,
} from './types';

const buildFieldErrorsFromZodIssues = (issues: ZodIssueMinimal[]) => {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of issues) {
    // Safely handle path segments (converting symbols to strings if any)
    const path =
      issue.path
        .map((segment) =>
          typeof segment === 'symbol' ? segment.toString() : segment,
        )
        .join('.') || '_root';

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
