import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

describe('security headers', () => {
  it('does not allow unsafe-inline in the script-src CSP directive', async () => {
    const headers = (await nextConfig.headers?.()) ?? [];
    const cspHeader = headers
      .find((entry) => entry.source === '/(.*)')
      ?.headers.find((header) => header.key === 'Content-Security-Policy');

    expect(cspHeader).toBeDefined();
    expect(cspHeader?.value).toContain(
      "script-src 'self' https://va.vercel-scripts.com",
    );
    expect(cspHeader?.value).not.toContain(
      "script-src 'self' https://va.vercel-scripts.com 'unsafe-inline'",
    );
  });
});
