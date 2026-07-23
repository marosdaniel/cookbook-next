import { describe, expect, it, vi } from 'vitest';
import robots from './robots';

describe('robots', () => {
  it('allows public pages and points crawlers to the sitemap', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://cookbook.example.com');

    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/me/',
          '/login',
          '/signup',
          '/reset-password',
          '/recipes/create',
          '/recipes/*/edit',
        ],
      },
      sitemap: 'https://cookbook.example.com/sitemap.xml',
    });
  });
});
