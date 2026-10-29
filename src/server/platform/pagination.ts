export const DEFAULT_QUERY_MAX_LIMIT = 100;

export const resolveQueryLimit = (limit?: number | null) => {
  if (limit === undefined || limit === null) {
    return undefined;
  }

  if (!Number.isFinite(limit)) {
    return undefined;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), DEFAULT_QUERY_MAX_LIMIT);
};
