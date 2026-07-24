import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

describe('security headers', () => {
  it('keeps production CSP strict while allowing dev-time inline scripts', async () => {
    const headers = (await nextConfig.headers?.()) ?? [];
    const cspHeader = headers
      .find((entry) => entry.source === '/(.*)')
      ?.headers.find((header) => header.key === 'Content-Security-Policy');

    expect(cspHeader).toBeDefined();

    const scriptSrcDirective = cspHeader?.value
      .split(';')
      .find((directive) => directive.trim().startsWith('script-src'));

    expect(scriptSrcDirective).toBeDefined();
    expect(scriptSrcDirective).toContain("script-src 'self'");

    if (process.env.NODE_ENV === 'development') {
      expect(scriptSrcDirective).toContain("'unsafe-inline'");
    } else {
      expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
    }
  });
});
