export const DEFAULT_QUERY_MAX_LIMIT = 100;

export const encodeCursor = (payload: object): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

export const decodeCursor = <T>(
  cursor: string | undefined,
  isValid: (value: unknown) => value is T,
): T | null => {
  if (!cursor) return null;
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(cursor, 'base64url').toString(),
    );
    return isValid(decoded) ? decoded : null;
  } catch {
    return null;
  }
};

export const resolveQueryLimit = (limit?: number | null) => {
  if (limit === undefined || limit === null) {
    return undefined;
  }

  if (!Number.isFinite(limit)) {
    return undefined;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), DEFAULT_QUERY_MAX_LIMIT);
};
