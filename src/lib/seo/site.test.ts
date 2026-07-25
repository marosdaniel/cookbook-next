import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSiteUrl } from './site';

describe('getSiteUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers the configured public URL and removes a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://cookbook.example.com/');

    expect(getSiteUrl()).toBe('https://cookbook.example.com');
  });

  it('uses the Vercel production hostname when no public URL is configured', () => {
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'cookbook.example.com');

    expect(getSiteUrl()).toBe('https://cookbook.example.com');
  });

  it('prepends https:// if protocol is missing from environment variables', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'cookbook-next-pi.vercel.app');

    expect(getSiteUrl()).toBe('https://cookbook-next-pi.vercel.app');
  });

  it('falls back to VERCEL_URL if NEXT_PUBLIC_SITE_URL and VERCEL_PROJECT_PRODUCTION_URL are missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    vi.stubEnv('VERCEL_URL', 'cookbook-next-pi.vercel.app');

    expect(getSiteUrl()).toBe('https://cookbook-next-pi.vercel.app');
  });
});
