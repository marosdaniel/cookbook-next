import { describe, expect, it } from 'vitest';
import nextConfig from './next.config';

describe('security headers', () => {
  it('keeps production CSP strict while allowing dev-time inline scripts', async () => {
    const headers = (await nextConfig.headers?.()) ?? [];
    const cspHeader = headers
      .find((entry) => entry.source === '/(.*)')
      ?.headers.find((header) => header.key === 'Content-Security-Policy');

    expect(cspHeader).toBeDefined();
    expect(cspHeader?.value).toContain(
      "script-src 'self' https://va.vercel-scripts.com",
    );

    if (process.env.NODE_ENV === 'development') {
      expect(cspHeader?.value).toContain("'unsafe-inline'");
    } else {
      expect(cspHeader?.value).not.toContain("'unsafe-inline'");
    }
  });
});
