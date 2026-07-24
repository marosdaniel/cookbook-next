import crypto from 'node:crypto';
import type { DocumentNode } from 'graphql';
import { parse, print, visit } from 'graphql';

export const DEFAULT_GRAPHQL_MAX_LIMIT = 100;

export const resolveQueryLimit = (limit?: number) => {
  if (limit === undefined || limit === null) {
    return undefined;
  }

  if (!Number.isFinite(limit)) {
    return undefined;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), DEFAULT_GRAPHQL_MAX_LIMIT);
};

/**
 * Normalize and hash a GraphQL document (already parsed AST).
 * Used to match hashes computed by the client-side persistedQueryLink.
 */
export const getPersistedQueryHashFromDocument = (
  document: DocumentNode | string,
) => {
  const parsed = typeof document === 'string' ? parse(document) : document;

  const normalizedDocument = visit(parsed, {
    Field: (node) => {
      if (node.name.value === '__typename') {
        return null;
      }

      return undefined;
    },
  });

  const normalizedQuery = print(normalizedDocument);
  return crypto.createHash('sha256').update(normalizedQuery).digest('hex');
};

export const validatePersistedQuery = (
  query: string,
  persistedHash?: string,
) => {
  if (!persistedHash) {
    return false;
  }

  return getPersistedQueryHashFromDocument(query) === persistedHash;
};
