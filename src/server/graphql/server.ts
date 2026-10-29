import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloArmor } from '@escape.tech/graphql-armor';
import type { NextRequest } from 'next/server';
import { resolvers } from '@/lib/graphql/resolvers';
import { resolvers as scalarResolvers, typeDefs } from '@/lib/graphql/schema';
import type { GraphQLContext } from '@/types/graphql/context';
import { createGraphQLContext } from './context';
import { graphqlPlugins } from './plugins';

const armor = new ApolloArmor({
  maxDepth: {
    enabled: true,
    n: 7,
  },
  costLimit: {
    enabled: true,
    maxCost: 1000,
  },
  maxAliases: {
    enabled: true,
    n: 15,
  },
  maxDirectives: {
    enabled: true,
    n: 50,
  },
  maxTokens: {
    enabled: true,
    n: 1000,
  },
});

const protection = armor.protect();

export const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
  plugins: [...protection.plugins, ...graphqlPlugins],
  validationRules: [...protection.validationRules],
  introspection: process.env.NODE_ENV !== 'production',
  allowBatchedHttpRequests: false,
  formatError: (formattedError) => {
    const publicErrorCodes = new Set([
      'BAD_USER_INPUT',
      'BAD_REQUEST',
      'PERSISTED_QUERY_NOT_ALLOWED',
      'UNAUTHENTICATED',
      'FORBIDDEN',
      'NOT_FOUND',
      'RATE_LIMITED',
    ]);

    const code = formattedError.extensions?.code?.toString();
    const isProduction = process.env.NODE_ENV === 'production';

    const extensions = { ...(formattedError.extensions ?? undefined) };
    delete extensions.stacktrace;
    delete extensions.exception;

    if (isProduction && !publicErrorCodes.has(code ?? '')) {
      return {
        message: 'Internal server error',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      };
    }

    return {
      ...formattedError,
      extensions,
    };
  },
});

export const graphqlNextHandler = startServerAndCreateNextHandler<
  NextRequest,
  GraphQLContext
>(server, {
  context: createGraphQLContext,
});
