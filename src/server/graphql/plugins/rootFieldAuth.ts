import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import {
  type DocumentNode,
  type FragmentDefinitionNode,
  GraphQLError,
  Kind,
  type OperationDefinitionNode,
  type SelectionSetNode,
} from 'graphql';
import { assertGraphQLOperationAuthorized } from '@/lib/graphql/authorization';
import type { GraphQLContext } from '@/types/graphql/context';
import type { UserRole } from '@/types/user';

const INTROSPECTION_ROOT_FIELDS = new Set(['__schema', '__type']);

export function collectRootFields(
  doc: DocumentNode,
  op: OperationDefinitionNode,
): string[] {
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const def of doc.definitions) {
    if (def.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(def.name.value, def);
    }
  }

  const names: string[] = [];
  const visitedFragments = new Set<string>();

  const walk = (set: SelectionSetNode | undefined) => {
    if (!set) return;
    for (const sel of set.selections) {
      if (sel.kind === Kind.FIELD) {
        names.push(sel.name.value);
      } else if (sel.kind === Kind.INLINE_FRAGMENT) {
        walk(sel.selectionSet);
      } else if (sel.kind === Kind.FRAGMENT_SPREAD) {
        const fragName = sel.name.value;
        if (visitedFragments.has(fragName)) continue;
        visitedFragments.add(fragName);
        const frag = fragments.get(fragName);
        if (frag) {
          walk(frag.selectionSet);
        }
      }
    }
  };

  walk(op.selectionSet);
  return names;
}

export function assertGraphQLRootFieldsAuthorized(
  doc: DocumentNode | undefined,
  op: OperationDefinitionNode | undefined,
  operationName: string | null | undefined,
  userRole?: UserRole,
): void {
  if (!operationName) {
    throw new GraphQLError(
      'GraphQL operations must provide an operation name.',
      {
        extensions: {
          code: 'BAD_REQUEST',
          http: { status: 400 },
        },
      },
    );
  }

  if (!doc || !op) {
    assertGraphQLOperationAuthorized(operationName, userRole);
    return;
  }

  const rootFields = collectRootFields(doc, op).filter(
    (field) => field !== '__typename',
  );

  if (rootFields.length === 0) {
    assertGraphQLOperationAuthorized(operationName, userRole);
    return;
  }

  const isDevIntrospectionAllowed = process.env.NODE_ENV !== 'production';

  for (const fieldName of rootFields) {
    if (isDevIntrospectionAllowed && INTROSPECTION_ROOT_FIELDS.has(fieldName)) {
      continue;
    }

    assertGraphQLOperationAuthorized(fieldName, userRole);
  }
}

export const rootFieldAuthPlugin: ApolloServerPlugin<GraphQLContext> = {
  requestDidStart(): Promise<GraphQLRequestListener<GraphQLContext>> {
    return Promise.resolve({
      async didResolveOperation(requestContext) {
        const { operationName, document, operation } = requestContext;
        const { role } = requestContext.contextValue;

        assertGraphQLRootFieldsAuthorized(
          document,
          operation,
          operationName,
          role,
        );

        requestContext.contextValue.operationName = operationName;
      },
    });
  },
};
