import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/lib/graphql/typeDefs/**/*.graphql',
  documents: ['src/lib/graphql/queries.ts', 'src/lib/graphql/mutations.ts'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: {
        documentMode: 'string',
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
