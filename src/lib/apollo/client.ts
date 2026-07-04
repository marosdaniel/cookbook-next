import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

type ErrorPolicy = 'all' | 'ignore' | 'none';

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

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getFavoriteRecipes: {
            keyArgs: ['userId', 'limit'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          getRecipes: {
            keyArgs: ['limit', 'filter'],
            merge(existing, incoming) {
              if (!existing) {
                return incoming;
              }

              return {
                ...incoming,
                recipes: [...(existing.recipes ?? []), ...(incoming.recipes ?? [])],
                totalRecipes:
                  incoming.totalRecipes ?? existing.totalRecipes ?? 0,
              };
            },
          },
          getRecipesByUserId: {
            keyArgs: ['userId', 'limit'],
            merge(existing, incoming) {
              if (!existing) {
                return incoming;
              }

              return {
                ...incoming,
                recipes: [...(existing.recipes ?? []), ...(incoming.recipes ?? [])],
                totalRecipes:
                  incoming.totalRecipes ?? existing.totalRecipes ?? 0,
              };
            },
          },
          getFollowing: {
            keyArgs: ['userId', 'limit'],
            merge(existing, incoming) {
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
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
  },
});
