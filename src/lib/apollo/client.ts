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
      Query: {},
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
  },
});
