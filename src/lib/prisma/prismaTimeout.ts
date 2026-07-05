const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Wraps Prisma operations with an application-level timeout guard.
 *
 * This does not cancel the underlying database query; it only rejects the in-flight
 * promise on the application side so GraphQL requests fail fast. Any real database-side
 * cancellation requires a database-specific mechanism such as statement_timeout.
 */
const withPrismaTimeout = async <T>(operation: Promise<T>, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Prisma operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
};

export const createPrismaTimeoutProxy = <T extends object>(
  target: T,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): T => {
  return new Proxy(target, {
    get(targetValue, property, receiver) {
      const value = Reflect.get(targetValue, property, receiver);

      if (property === '$transaction' && typeof value === 'function') {
        return (...args: unknown[]) => {
          const [callback, ...rest] = args;

          const wrappedCallback =
            typeof callback === 'function'
              ? async (...callbackArgs: unknown[]) => {
                  const [transaction, ...callbackRest] = callbackArgs;
                  const proxiedTransaction =
                    transaction && typeof transaction === 'object' && transaction !== null
                      ? createPrismaTimeoutProxy(transaction, timeoutMs)
                      : transaction;

                  return callback(proxiedTransaction, ...callbackRest);
                }
              : callback;

          const result = value.apply(targetValue, [wrappedCallback, ...rest]);
          return result instanceof Promise ? withPrismaTimeout(result, timeoutMs) : result;
        };
      }

      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const result = value.apply(targetValue, args);
          return result instanceof Promise ? withPrismaTimeout(result, timeoutMs) : result;
        };
      }

      if (value && typeof value === 'object') {
        return createPrismaTimeoutProxy(value, timeoutMs);
      }

      return value;
    },
  });
};
