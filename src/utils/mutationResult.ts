export const getMutationResultState = (result: unknown) => {
  if (typeof result === 'boolean') {
    return { isSuccess: result, message: undefined };
  }

  if (result && typeof result === 'object') {
    const record = result as { success?: unknown; message?: unknown };

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
