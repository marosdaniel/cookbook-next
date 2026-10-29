import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import {
  type DocumentNode,
  GraphQLError,
  type OperationDefinitionNode,
} from 'graphql';
import {
  executeRateLimitWithFallback,
  getRateLimitGroupForField,
  type RateLimitGroupName,
} from '@/lib/rateLimit/rateLimit';
import type { GraphQLContext } from '@/types/graphql/context';
import { collectRootFields } from './rootFieldAuth';

export async function enforceOperationRateLimits(
  doc: DocumentNode | undefined,
  op: OperationDefinitionNode | undefined,
  operationName: string | null | undefined,
  context: Pick<GraphQLContext, 'userId' | 'clientKey'>,
): Promise<void> {
  const fieldsToCheck =
    doc && op
      ? collectRootFields(doc, op).filter((field) => field !== '__typename')
      : operationName
        ? [operationName]
        : [];

  const checkedGroups = new Set<RateLimitGroupName>();

  for (const fieldName of fieldsToCheck) {
    const groupConfig = getRateLimitGroupForField(fieldName);
    if (!groupConfig || checkedGroups.has(groupConfig.group)) {
      continue;
    }

    checkedGroups.add(groupConfig.group);

    const key =
      groupConfig.keyStrategy === 'ip'
        ? (context.clientKey ?? 'anonymous')
        : (context.userId ?? context.clientKey ?? 'anonymous');

    const result = await executeRateLimitWithFallback(
      groupConfig.limiter,
      groupConfig.fallbackLimiter,
      key,
    );

    if (!result.success) {
      throw new GraphQLError('Too many requests', {
        extensions: {
          code: 'RATE_LIMITED',
          group: groupConfig.group,
          http: {
            status: 429,
            headers: new Map([
              ['X-RateLimit-Limit', result.limit.toString()],
              ['X-RateLimit-Remaining', result.remaining.toString()],
            ]),
          },
        },
      });
    }
  }
}

export const rateLimitPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return Promise.resolve({
      async didResolveOperation(requestContext) {
        await enforceOperationRateLimits(
          requestContext.document,
          requestContext.operation,
          requestContext.operationName,
          requestContext.contextValue,
        );
      },
    });
  },
};
