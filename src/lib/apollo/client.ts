import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  HttpLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';
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

// Central error link: 'errorPolicy: ignore' used to swallow every GraphQL and
// network error silently (UI saw an "empty success"). We now surface a
// notification instead, while keeping partial data available to callers.
const errorLink = new ErrorLink(({ error, operation }) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (CombinedGraphQLErrors.is(error)) {
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

const getBrowserPersistedQueryHash = async (document: DocumentNode) => {
  const encodedQuery = new TextEncoder().encode(print(document));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encodedQuery);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
};

const persistedQueryLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let subscription: { unsubscribe: () => void } | undefined;

    getBrowserPersistedQueryHash(operation.query)
      .then((sha256Hash) => {
        operation.extensions = {
          ...operation.extensions,
          persistedQuery: { version: 1, sha256Hash },
        };

        subscription = forward(operation).subscribe(observer);
      })
      .catch((error: unknown) => observer.error(error));

    return () => subscription?.unsubscribe();
  });
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
