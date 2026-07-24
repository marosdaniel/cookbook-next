/**
 * Standard operation response structure
 */
export type OperationResponse = {
  success: boolean;
  message: string;
  messageKey: string;
  statusCode: number;
};

/**
 * Mutation result - can be a boolean or an object with success and optional message
 */
export type MutationResult = boolean | { success?: boolean; message?: string };

/**
 * Basic mutation response
 */
export type MutationResponse = {
  success: boolean;
  message: string;
};

/**
 * Mutation response with optional messageKey
 */
export type MutationResponseWithMessageKey = MutationResponse & {
  messageKey?: string;
};

/**
 * Mutation response with optional messageKey and statusCode
 */
export type MutationResponseWithStatusCode = MutationResponse & {
  messageKey?: string;
  statusCode?: number;
};
