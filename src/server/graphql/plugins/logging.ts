import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { logger } from '@/server/platform/logger';
import type { GraphQLContext } from '@/types/graphql/context';

/**
 * Plugin to emit structured GraphQL request logs for monitoring and audit purposes.
 */
export const loggingPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(
    requestContext,
  ): Promise<GraphQLRequestListener<GraphQLContext>> {
    const startedAt = performance.now();
    let errorCode: string | undefined;
    return Promise.resolve({
      didResolveOperation(requestContext) {
        const { operationName } = requestContext;
        requestContext.contextValue.operationName = operationName;
        return Promise.resolve();
      },
      didEncounterErrors({ errors }) {
        errorCode = errors[0]?.extensions?.code?.toString();
        return Promise.resolve();
      },
      willSendResponse({ contextValue, response }) {
        const status = response.http?.status ?? (errorCode ? 500 : 200);
        logger.info({
          event: 'graphql.request',
          requestId: contextValue.requestId ?? 'unknown',
          operationName:
            contextValue.operationName ?? requestContext.operationName,
          durationMs: Math.round(performance.now() - startedAt),
          status,
          userClass: contextValue.userId ? 'authenticated' : 'anonymous',
          ...(errorCode ? { errorCode } : {}),
        });
        return Promise.resolve();
      },
    });
  },
};
