import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { type DocumentNode, GraphQLError } from 'graphql';
import { env } from '@/env';
import { isDocumentAllowed } from '@/lib/graphql/persistedQueryRegistry';
import type { GraphQLContext } from '@/types/graphql/context';

export const isAllowlistEnforced = (): boolean => {
  if (env.GRAPHQL_ALLOWLIST_ENFORCE === 'true') {
    return true;
  }
  if (env.GRAPHQL_ALLOWLIST_ENFORCE === 'false') {
    return false;
  }
  return process.env.NODE_ENV === 'production';
};

export const assertAllowedDocument = (document: DocumentNode | string) => {
  if (!isAllowlistEnforced()) {
    return;
  }

  if (!isDocumentAllowed(document)) {
    throw new GraphQLError('Persisted query is not in the server allowlist.', {
      extensions: {
        code: 'PERSISTED_QUERY_NOT_ALLOWED',
        http: { status: 400 },
      },
    });
  }
};

export const allowlistPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return Promise.resolve({
      async didResolveOperation(requestContext) {
        assertAllowedDocument(requestContext.document);
      },
    });
  },
};
