import { Kind, type OperationDefinitionNode, parse } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetGroup, mockExecute, mockAssertAuthorized } = vi.hoisted(() => ({
  mockGetGroup: vi.fn(),
  mockExecute: vi.fn(),
  mockAssertAuthorized: vi.fn(),
}));

vi.mock('@/lib/rateLimit/rateLimit', () => ({
  getRateLimitGroupForField: mockGetGroup,
  executeRateLimitWithFallback: mockExecute,
}));
vi.mock('@/lib/graphql/authorization', () => ({
  assertGraphQLOperationAuthorized: mockAssertAuthorized,
}));

import { enforceOperationRateLimits, rateLimitPlugin } from './rateLimit';

const parseOperation = (source: string) => {
  const doc = parse(source);
  const op = doc.definitions.find(
    (def): def is OperationDefinitionNode =>
      def.kind === Kind.OPERATION_DEFINITION,
  );
  if (!op) throw new Error('no operation in test source');
  return { doc, op };
};

const groupConfig = (group: string, keyStrategy: 'ip' | 'user') => ({
  group,
  keyStrategy,
  limiter: { name: `${group}-limiter` },
  fallbackLimiter: { name: `${group}-fallback` },
});

const context = { userId: 'user-1', clientKey: 'client-1' };

describe('enforceOperationRateLimits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue({ success: true, limit: 10, remaining: 9 });
    mockGetGroup.mockReturnValue(null);
  });

  it('checks each rate-limit group once per operation', async () => {
    const { doc, op } = parseOperation(`
      mutation M { createRecipe { id } updateRecipe { id } }
    `);
    mockGetGroup.mockReturnValue(groupConfig('content-write', 'user'));

    await enforceOperationRateLimits(doc, op, 'M', context);

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('skips fields that have no rate-limit group', async () => {
    const { doc, op } = parseOperation(`query Q { __typename recipes { id } }`);

    await enforceOperationRateLimits(doc, op, 'Q', context);

    expect(mockGetGroup).toHaveBeenCalledWith('recipes');
    expect(mockGetGroup).not.toHaveBeenCalledWith('__typename');
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('keys ip-based groups by clientKey', async () => {
    const { doc, op } = parseOperation(`query Q { login { id } }`);
    const config = groupConfig('auth-sensitive', 'ip');
    mockGetGroup.mockReturnValue(config);

    await enforceOperationRateLimits(doc, op, 'Q', context);

    expect(mockExecute).toHaveBeenCalledWith(
      config.limiter,
      config.fallbackLimiter,
      'client-1',
    );
  });

  it('keys user-based groups by userId, then clientKey, then anonymous', async () => {
    const { doc, op } = parseOperation(`query Q { rateRecipe { id } }`);
    const config = groupConfig('rating', 'user');
    mockGetGroup.mockReturnValue(config);

    await enforceOperationRateLimits(doc, op, 'Q', context);
    await enforceOperationRateLimits(doc, op, 'Q', {
      userId: undefined,
      clientKey: undefined,
    });

    expect(mockExecute.mock.calls[0][2]).toBe('user-1');
    expect(mockExecute.mock.calls[1][2]).toBe('anonymous');
  });

  it('throws RATE_LIMITED with headers when the limiter rejects', async () => {
    const { doc, op } = parseOperation(`mutation M { createRecipe { id } }`);
    mockGetGroup.mockReturnValue(groupConfig('content-write', 'user'));
    mockExecute.mockResolvedValue({ success: false, limit: 5, remaining: 0 });

    await expect(
      enforceOperationRateLimits(doc, op, 'M', context),
    ).rejects.toMatchObject({
      extensions: {
        code: 'RATE_LIMITED',
        group: 'content-write',
        http: { status: 429 },
      },
    });
  });

  it('uses operationName when no document is available', async () => {
    mockGetGroup.mockReturnValue(groupConfig('admin', 'user'));

    await enforceOperationRateLimits(
      undefined,
      undefined,
      'deleteUser',
      context,
    );

    expect(mockGetGroup).toHaveBeenCalledWith('deleteUser');
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there is neither document nor operation name', async () => {
    await enforceOperationRateLimits(undefined, undefined, null, context);

    expect(mockGetGroup).not.toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
  });
});

describe('rateLimitPlugin', () => {
  it('enforces limits on didResolveOperation', async () => {
    const { doc, op } = parseOperation(`mutation M { createRecipe { id } }`);
    mockGetGroup.mockReturnValue(groupConfig('content-write', 'user'));
    mockExecute.mockResolvedValue({ success: true, limit: 1, remaining: 0 });

    const listener = await rateLimitPlugin.requestDidStart?.({} as never);
    await listener?.didResolveOperation?.({
      document: doc,
      operation: op,
      operationName: 'M',
      contextValue: context,
    } as never);

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });
});
