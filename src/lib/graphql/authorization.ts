import { GraphQLError } from 'graphql';
import type { UserRole } from '../../types/user';
import {
  canUserPerformOperation,
  getRequiredRolesForOperation,
} from './operationsConfig';

type AssertGraphQLOperationAuthorized = (
  operationName: string | null | undefined,
  userRole?: UserRole,
) => asserts operationName is string;

export const assertGraphQLOperationAuthorized: AssertGraphQLOperationAuthorized =
  (operationName, userRole) => {
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

    if (canUserPerformOperation(operationName, userRole)) {
      return;
    }

    const requiredRoles = getRequiredRolesForOperation(operationName);
    const requiredRoleText =
      requiredRoles === 'PUBLIC' ? 'Public' : requiredRoles.join(', ');

    throw new GraphQLError(
      `Unauthorized: you don't have permission to perform '${operationName}'`,
      {
        extensions: {
          code: 'FORBIDDEN',
          http: { status: 403 },
          requiredRole: requiredRoleText,
        },
      },
    );
  };
