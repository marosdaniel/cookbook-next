import crypto from 'node:crypto';

export const DEFAULT_GRAPHQL_MAX_LIMIT = 100;

export const resolveQueryLimit = (limit?: number) => {
  if (limit === undefined || limit === null) {
    return undefined;
  }

  if (!Number.isFinite(limit)) {
    return undefined;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), DEFAULT_GRAPHQL_MAX_LIMIT);
};

export const getPersistedQueryHash = (query: string) => {
  return crypto.createHash('sha256').update(query).digest('hex');
};

export const validatePersistedQuery = (query: string, persistedHash?: string) => {
  if (!persistedHash) {
    return false;
  }

  return getPersistedQueryHash(query) === persistedHash;
};
