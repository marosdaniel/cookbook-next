import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: { info: vi.fn() },
}));

vi.mock('@/server/platform/logger', () => ({ logger: mockLogger }));

import { loggingPlugin } from './logging';

const startRequest = async () => {
  const listener = await loggingPlugin.requestDidStart?.({
    operationName: 'Recipes',
  } as never);
  if (!listener) {
    throw new Error('loggingPlugin did not return a listener');
  }
  return listener;
};

describe('loggingPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs a successful anonymous request with status 200', async () => {
    const listener = await startRequest();
    const contextValue = { requestId: 'req-1' };

    await listener.didResolveOperation?.({
      operationName: 'Recipes',
      contextValue,
    } as never);
    await listener.willSendResponse?.({
      contextValue,
      response: { http: { status: 200 } },
    } as never);

    expect(contextValue).toMatchObject({ operationName: 'Recipes' });
    expect(mockLogger.info).toHaveBeenCalledWith({
      event: 'graphql.request',
      requestId: 'req-1',
      operationName: 'Recipes',
      durationMs: expect.any(Number),
      status: 200,
      userClass: 'anonymous',
    });
  });

  it('marks authenticated requests as authenticated', async () => {
    const listener = await startRequest();
    const contextValue = { requestId: 'req-2', userId: 'u-1' };

    await listener.willSendResponse?.({
      contextValue,
      response: { http: { status: 200 } },
    } as never);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ userClass: 'authenticated' }),
    );
  });

  it('logs the error code and HTTP status when errors occurred', async () => {
    const listener = await startRequest();
    const contextValue = { requestId: 'req-3' };

    await listener.didEncounterErrors?.({
      errors: [{ extensions: { code: 'FORBIDDEN' } }],
    } as never);
    await listener.willSendResponse?.({
      contextValue,
      response: { http: { status: 403 } },
    } as never);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, errorCode: 'FORBIDDEN' }),
    );
  });

  it('falls back to status 500 when errors occurred without an HTTP status', async () => {
    const listener = await startRequest();

    await listener.didEncounterErrors?.({
      errors: [{ extensions: { code: 'INTERNAL_SERVER_ERROR' } }],
    } as never);
    await listener.willSendResponse?.({
      contextValue: {},
      response: {},
    } as never);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        requestId: 'unknown',
        errorCode: 'INTERNAL_SERVER_ERROR',
      }),
    );
  });

  it('omits errorCode when the first error has no code', async () => {
    const listener = await startRequest();

    await listener.didEncounterErrors?.({
      errors: [{ extensions: {} }],
    } as never);
    await listener.willSendResponse?.({
      contextValue: {},
      response: {},
    } as never);

    const logged = mockLogger.info.mock.calls[0]?.[0];
    expect(logged).not.toHaveProperty('errorCode');
  });

  it('falls back to status 200 when no errors and no HTTP status are present', async () => {
    const listener = await startRequest();

    await listener.willSendResponse?.({
      contextValue: {},
      response: {},
    } as never);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200 }),
    );
  });
});
