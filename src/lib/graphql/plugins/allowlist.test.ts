import { parse, print } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET_RECIPES } from '@/lib/graphql/queries';
import {
  allowlistPlugin,
  assertAllowedDocument,
  isAllowlistEnforced,
} from './allowlist';

describe('allowlistPlugin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('enforces by default in production and disables by default in non-production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAllowlistEnforced()).toBe(false);

    vi.stubEnv('NODE_ENV', 'production');
    expect(isAllowlistEnforced()).toBe(true);
  });

  it('respects explicit GRAPHQL_ALLOWLIST_ENFORCE override', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('GRAPHQL_ALLOWLIST_ENFORCE', 'true');
    expect(isAllowlistEnforced()).toBe(true);

    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('GRAPHQL_ALLOWLIST_ENFORCE', 'false');
    expect(isAllowlistEnforced()).toBe(false);
  });

  it('allows registered client documents even with extra __typename fields', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const rawQuery = print(GET_RECIPES).replace(
      'totalRecipes',
      '__typename totalRecipes',
    );
    const parsedDoc = parse(rawQuery);

    expect(() => assertAllowedDocument(parsedDoc)).not.toThrow();

    const listener = await allowlistPlugin.requestDidStart?.({} as never);
    await expect(
      listener?.didResolveOperation?.({ document: parsedDoc } as never),
    ).resolves.toBeUndefined();
  });

  it('rejects unknown documents when enforcement is active', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const unknownDoc = parse('query EvilQuery { getRecipes { totalRecipes } }');

    expect(() => assertAllowedDocument(unknownDoc)).toThrowError(
      expect.objectContaining({
        message: 'Persisted query is not in the server allowlist.',
        extensions: expect.objectContaining({
          code: 'PERSISTED_QUERY_NOT_ALLOWED',
          http: { status: 400 },
        }),
      }),
    );

    const listener = await allowlistPlugin.requestDidStart?.({} as never);
    await expect(
      listener?.didResolveOperation?.({ document: unknownDoc } as never),
    ).rejects.toMatchObject({
      extensions: {
        code: 'PERSISTED_QUERY_NOT_ALLOWED',
      },
    });
  });

  it('skips allowlist check when enforcement is disabled', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('GRAPHQL_ALLOWLIST_ENFORCE', 'false');
    const unknownDoc = parse('query DevQuery { getRecipes { totalRecipes } }');

    expect(() => assertAllowedDocument(unknownDoc)).not.toThrow();
  });
});
