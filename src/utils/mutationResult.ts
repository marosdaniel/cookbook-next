import type { MutationResult } from '@/types/graphql/responses';

export const getMutationResultState = (result: unknown) => {
  if (typeof result === 'boolean') {
    return { isSuccess: result, message: undefined };
  }

  if (result && typeof result === 'object') {
    const record = result as Exclude<MutationResult, boolean>;

    return {
      isSuccess: record.success === true,
      message:
        typeof record.message === 'string' && record.message.trim().length > 0
          ? record.message
          : undefined,
    };
  }

  return { isSuccess: false, message: undefined };
};
