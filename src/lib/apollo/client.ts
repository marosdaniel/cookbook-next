import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import type { DocumentNode } from 'graphql';
import { print, visit } from 'graphql';
import { store } from '@/lib/store';
import deMessages from '@/locales/de.json';
import enGbMessages from '@/locales/en-gb.json';
import huMessages from '@/locales/hu.json';
import type { Locale } from '@/types/common';
import { showErrorNotification } from '@/utils/notifications';

type ErrorPolicy = 'all' | 'ignore' | 'none';

type ApiErrorMessages = {
  notifications: { apiErrorTitle: string; apiErrorMessage: string };
};

const localeMessages: Record<Locale, ApiErrorMessages> = {
  'en-gb': enGbMessages as ApiErrorMessages,
  de: deMessages as ApiErrorMessages,
  hu: huMessages as ApiErrorMessages,
};

const getApiErrorNotificationCopy = () => {
  const { locale } = store.getState().global;
  const messages = localeMessages[locale] ?? localeMessages['en-gb'];

  return {
    title: messages.notifications.apiErrorTitle,
    message: messages.notifications.apiErrorMessage,
  };
};

// The global error link surfaces operational failures, while keeping partial
// data available to callers via errorPolicy: 'all'. Expected business/auth
// failures are intentionally left to the calling component for local handling.
const errorLink = new ErrorLink(({ error, operation }) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (CombinedGraphQLErrors.is(error)) {
    const codes = error.errors.map((item) => item.extensions?.code);

    if (
      codes.includes('BAD_USER_INPUT') ||
      codes.includes('UNAUTHENTICATED') ||
      codes.includes('FORBIDDEN')
    ) {
      return;
    }

    console.error(`[GraphQL error] ${operation.operationName}:`, error.errors);
  } else if (CombinedProtocolErrors.is(error)) {
    console.error(`[Protocol error] ${operation.operationName}:`, error.errors);
  } else {
    console.error(`[Network error] ${operation.operationName}:`, error);
  }

  const { title, message } = getApiErrorNotificationCopy();

  showErrorNotification(title, message);
});

declare module '@apollo/client' {
  export interface TypeOverrides {
    signatureStyle: 'classic';
  }

  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface WatchQuery {
        errorPolicy: ErrorPolicy;
      }
      interface Query {
        errorPolicy: ErrorPolicy;
      }
      interface Mutate {
        errorPolicy: ErrorPolicy;
      }
    }
  }
}

// HTTP link to GraphQL API
const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

/**
 * Normalize a GraphQL document for persistent query hashing.
 * Must match the server-side normalization in protection.ts.
 */
const normalizeGraphQLDocument = (document: DocumentNode): string => {
  const normalizedDocument = visit(document, {
    Field: (node) => {
      if (node.name.value === '__typename') {
        return null;
      }

      return undefined;
    },
  });

  return print(normalizedDocument);
};

/**
 * Compute SHA-256 hash of a normalized GraphQL query.
 * Matches the server-side getPersistedQueryHashFromDocument implementation.
 */
const _getBrowserPersistedQueryHash = async (document: DocumentNode) => {
  const normalizedQuery = normalizeGraphQLDocument(document);

  // Convert to bytes using UTF-8 encoding (same as Node.js crypto.update default)
  const encodedQuery = new TextEncoder().encode(normalizedQuery);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encodedQuery);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};

// DISABLED: APQ hash mismatches due to normalization differences between client/server.
// The print() function or visit() behavior differs between versions/environments.
// Use full query strings instead for now.
const persistedQueryLink = new ApolloLink((operation, forward) => {
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, persistedQueryLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getFavoriteRecipes: {
            keyArgs: ['limit'],
            merge(incoming, existing = []) {
              return [...existing, ...incoming];
            },
          },
          getRecipes: {
            keyArgs: ['limit', 'filter'],
            merge(incoming, existing = []) {
              if (!existing) {
                return incoming;
              }

              return {
                ...incoming,
                recipes: [
                  ...(existing.recipes ?? []),
                  ...(incoming.recipes ?? []),
                ],
                totalRecipes:
                  incoming.totalRecipes ?? existing.totalRecipes ?? 0,
              };
            },
          },
          getRecipesByUserId: {
            keyArgs: ['userId', 'limit'],
            merge(incoming, existing = []) {
              if (!existing) {
                return incoming;
              }

              return {
                ...incoming,
                recipes: [
                  ...(existing.recipes ?? []),
                  ...(incoming.recipes ?? []),
                ],
                totalRecipes:
                  incoming.totalRecipes ?? existing.totalRecipes ?? 0,
              };
            },
          },
          getFollowing: {
            keyArgs: ['limit'],
            merge(incoming, existing = []) {
              if (!existing) {
                return incoming;
              }

              return {
                ...incoming,
                users: [...(existing.users ?? []), ...(incoming.users ?? [])],
                totalFollowing:
                  incoming.totalFollowing ?? existing.totalFollowing ?? 0,
              };
            },
          },
        },
      },
      Recipe: {
        keyFields: ['id'],
      },
      User: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
