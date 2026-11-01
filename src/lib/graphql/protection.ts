import crypto from 'node:crypto';
import type { DocumentNode, FieldNode } from 'graphql';
import { parse, print, visit } from 'graphql';

export {
  DEFAULT_QUERY_MAX_LIMIT as DEFAULT_GRAPHQL_MAX_LIMIT,
  resolveQueryLimit,
} from '@/server/platform/pagination';

const stripTypenameVisitor = {
  Field: (node: FieldNode) => {
    if (node.name.value === '__typename') {
      return null;
    }

    return undefined;
  },
};

/**
 * Normalize and hash a GraphQL document (already parsed AST) for the persisted
 * query registry.
 */
export const getPersistedQueryHashFromDocument = (
  document: DocumentNode | string,
) => {
  const parsed = typeof document === 'string' ? parse(document) : document;

  const normalizedDocument = visit(parsed, stripTypenameVisitor);

  const normalizedQuery = print(normalizedDocument);
  return crypto.createHash('sha256').update(normalizedQuery).digest('hex');
};
