import type { DocumentNode } from 'graphql';
import { parse } from 'graphql';

/**
 * Extracts the operation name from a GraphQL query/mutation string
 */
export const extractOperationName = (query: string): string | null => {
  try {
    const parsedQuery: DocumentNode = parse(query);
    const firstDefinition = parsedQuery.definitions[0];

    if (
      firstDefinition?.kind === 'OperationDefinition' &&
      firstDefinition.selectionSet.selections.length > 0
    ) {
      const firstSelection = firstDefinition.selectionSet.selections[0];
      if (firstSelection.kind === 'Field') {
        return firstSelection.name.value;
      }
    }
  } catch {
    return null;
  }

  return null;
};

/**
 * Get GraphQL query string from Request body
 */
export const getQueryFromRequest = async (
  req: Request,
): Promise<string | null> => {
  try {
    // Using Next.js Request API
    const body = await req.clone().json();
    return body.query || null;
  } catch {
    return null;
  }
};

/**
 * Extracts the operation name from the GraphQL request
 * First checks the body.operationName, if not present, parses the query.
 */
export const getOperationNameFromRequest = async (
  req: Request,
): Promise<string | null> => {
  try {
    const body = await req.clone().json();

    // if operationName is directly provided
    if (body.operationName) {
      return body.operationName;
    }

    // If not, parse it from the query string
    if (body.query) {
      return extractOperationName(body.query);
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Checks if a request is an introspection query
 */
export const isIntrospectionQuery = (operationName: string | null): boolean => {
  return operationName === 'IntrospectionQuery';
};
