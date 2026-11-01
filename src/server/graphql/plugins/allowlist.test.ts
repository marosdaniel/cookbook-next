import { parse } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEnv, mockIsDocumentAllowed } = vi.hoisted(() => ({
  mockEnv: {
    env: {
      GRAPHQL_ALLOWLIST_ENFORCE: undefined as 'true' | 'false' | undefined,
    },
  },
  mockIsDocumentAllowed: vi.fn(),
}));

vi.mock('@/env', () => mockEnv);
vi.mock('@/lib/graphql/persistedQueryRegistry', () => ({
  isDocumentAllowed: mockIsDocumentAllowed,
}));

import {
  allowlistPlugin,
  assertAllowedDocument,
  isAllowlistEnforced,
} from './allowlist';

const DOCUMENT = parse('query Recipes { recipes { id } }');

describe('isAllowlistEnforced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = undefined;
    vi.unstubAllEnvs();
  });

  it('returns true when the env flag is "true"', () => {
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = 'true';
    expect(isAllowlistEnforced()).toBe(true);
  });

  it('returns false when the env flag is "false", even in production', () => {
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = 'false';
    vi.stubEnv('NODE_ENV', 'production');
    expect(isAllowlistEnforced()).toBe(false);
  });

  it('falls back to NODE_ENV=production when the flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isAllowlistEnforced()).toBe(true);
  });

  it('is disabled outside production when the flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAllowlistEnforced()).toBe(false);
  });
});

describe('assertAllowedDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = 'true';
  });

  it('skips the check when the allowlist is not enforced', () => {
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = 'false';

    expect(() => assertAllowedDocument(DOCUMENT)).not.toThrow();
    expect(mockIsDocumentAllowed).not.toHaveBeenCalled();
  });

  it('passes when the document is in the allowlist', () => {
    mockIsDocumentAllowed.mockReturnValue(true);

    expect(() => assertAllowedDocument(DOCUMENT)).not.toThrow();
    expect(mockIsDocumentAllowed).toHaveBeenCalledWith(DOCUMENT);
  });

  it('throws PERSISTED_QUERY_NOT_ALLOWED when the document is not allowed', () => {
    mockIsDocumentAllowed.mockReturnValue(false);

    expect(() => assertAllowedDocument('query X { x }')).toThrow(
      expect.objectContaining({
        message: 'Persisted query is not in the server allowlist.',
        extensions: {
          code: 'PERSISTED_QUERY_NOT_ALLOWED',
          http: { status: 400 },
        },
      }),
    );
  });
});

describe('allowlistPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.env.GRAPHQL_ALLOWLIST_ENFORCE = 'true';
  });

  it('checks the resolved operation document in didResolveOperation', async () => {
    mockIsDocumentAllowed.mockReturnValue(false);
    const listener = await allowlistPlugin.requestDidStart?.(
      undefined as never,
    );

    await expect(
      listener?.didResolveOperation?.({ document: DOCUMENT } as never),
    ).rejects.toMatchObject({
      extensions: { code: 'PERSISTED_QUERY_NOT_ALLOWED' },
    });
  });

  it('allows an allowlisted operation through', async () => {
    mockIsDocumentAllowed.mockReturnValue(true);
    const listener = await allowlistPlugin.requestDidStart?.(
      undefined as never,
    );

    await expect(
      listener?.didResolveOperation?.({ document: DOCUMENT } as never),
    ).resolves.toBeUndefined();
  });
});
