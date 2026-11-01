import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/rateLimit/rateLimit', () => ({
  checkPasswordResetEmailRateLimit: vi.fn(),
  getRateLimitGroupForField: vi.fn(() => null),
}));
vi.mock('@/lib/graphql/authorization', () => ({
  assertGraphQLOperationAuthorized: vi.fn(),
}));

import { allowlistPlugin } from './allowlist';
import { fieldAuthPlugin } from './fieldAuth';
import * as pluginIndex from './index';
import { loggingPlugin } from './logging';
import { rateLimitPlugin } from './rateLimit';
import { rootFieldAuthPlugin } from './rootFieldAuth';

describe('graphqlPlugins', () => {
  it('registers plugins in the expected order', () => {
    expect(pluginIndex.graphqlPlugins).toEqual([
      loggingPlugin,
      allowlistPlugin,
      rootFieldAuthPlugin,
      rateLimitPlugin,
      fieldAuthPlugin,
    ]);
  });

  it('re-exports the plugin helpers', () => {
    expect(pluginIndex.allowlistPlugin).toBe(allowlistPlugin);
    expect(pluginIndex.fieldAuthPlugin).toBe(fieldAuthPlugin);
    expect(pluginIndex.loggingPlugin).toBe(loggingPlugin);
    expect(pluginIndex.rateLimitPlugin).toBe(rateLimitPlugin);
    expect(pluginIndex.rootFieldAuthPlugin).toBe(rootFieldAuthPlugin);
    expect(typeof pluginIndex.assertAllowedDocument).toBe('function');
    expect(typeof pluginIndex.isAllowlistEnforced).toBe('function');
    expect(typeof pluginIndex.collectRootFields).toBe('function');
    expect(typeof pluginIndex.assertGraphQLRootFieldsAuthorized).toBe(
      'function',
    );
    expect(typeof pluginIndex.enforceOperationRateLimits).toBe('function');
  });
});
