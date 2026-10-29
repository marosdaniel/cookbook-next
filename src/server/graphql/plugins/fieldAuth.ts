import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import { canResolveUserField } from '@/lib/graphql/fieldPolicies';
import type { GraphQLContext } from '@/types/graphql/context';

export const fieldAuthPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return Promise.resolve({
      executionDidStart() {
        return Promise.resolve({
          willResolveField({ contextValue, info, source }) {
            if (info.parentType.name !== 'User') {
              return;
            }

            if (canResolveUserField(info.fieldName, source, contextValue)) {
              return;
            }

            throw new GraphQLError('Unauthorized field access', {
              extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 },
              },
            });
          },
        });
      },
    });
  },
};
