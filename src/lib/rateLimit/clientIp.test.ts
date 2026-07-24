import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRateLimitClientKey } from './clientIp';

const requestWithHeaders = (headers: Record<string, string>) =>
  new Request('https://cookbook.example/api/graphql', { headers });

describe('getRateLimitClientKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not trust forwarding headers outside a trusted proxy mode', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('TRUSTED_PROXY_MODE', '');

    expect(
      getRateLimitClientKey(
        requestWithHeaders({
          'x-forwarded-for': '203.0.113.10',
          'x-real-ip': '203.0.113.11',
        }),
      ),
    ).toBe('unknown-client');
  });

  it('uses Vercel x-real-ip only in trusted proxy mode', () => {
    vi.stubEnv('VERCEL', '1');

    expect(
      getRateLimitClientKey(
        requestWithHeaders({
          'x-forwarded-for': '203.0.113.10',
          'x-real-ip': '203.0.113.11',
        }),
      ),
    ).toBe('203.0.113.11');
  });

  it('rejects malformed trusted IP values', () => {
    vi.stubEnv('TRUSTED_PROXY_MODE', 'vercel');

    expect(
      getRateLimitClientKey(
        requestWithHeaders({ 'x-real-ip': '203.0.113.11, 198.51.100.2' }),
      ),
    ).toBe('unknown-client');
  });
});
