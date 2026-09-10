import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/lib/graphql/typeDefs/**/*.graphql',
  documents: ['src/lib/graphql/operations.graphql'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'documentNode',
        scalars: {
          DateTime: 'string',
        },
      },
    },
    'src/lib/graphql/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '@/types/graphql/context#GraphQLContext',
        scalars: {
          DateTime: {
            input: 'string',
            output: 'Date',
          },
        },
        enumValues: {
          UserRole: '@prisma/client#UserRole',
        },
        mappers: {
          Recipe: '@/lib/graphql/resolvers/types#RecipeResolverParent',
          User: '@/lib/graphql/resolvers/types#UserResolverParent',
        },
        useIndexSignature: true,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
