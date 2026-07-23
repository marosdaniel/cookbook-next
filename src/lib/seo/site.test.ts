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
});
