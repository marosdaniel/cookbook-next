import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

// HTTP link to GraphQL API
const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

// Auth middleware - automatically adds JWT token to every request
const authMiddleware = new ApolloLink((operation, forward) => {
  // Get token from localStorage, cookie, or next-auth session
  const token =
    globalThis.window === undefined ? null : localStorage.getItem('token');

  // If token exists, add it to Authorization header
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }));

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: authMiddleware.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        // fields: {
        //   // for pagination later
        //   recipes: {
        //     merge(_existing, incoming) {
        //       return incoming;
        //     },
        //   },
        // },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
