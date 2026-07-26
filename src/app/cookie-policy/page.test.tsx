import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockGetLocaleFromCookies,
  mockGetLocaleMessages,
  mockGetMetadata,
  mockHeaders,
} = vi.hoisted(() => ({
  mockGetLocaleFromCookies: vi.fn(),
  mockGetLocaleMessages: vi.fn(),
  mockGetMetadata: vi.fn(),
  mockHeaders: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mockGetLocaleFromCookies,
}));

vi.mock('@/lib/locale/locale', () => ({
  getLocaleMessages: mockGetLocaleMessages,
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: mockGetMetadata,
}));

vi.mock('@/components/legal/ReadingProgress', () => ({
  default: () => null,
}));

import CookiePolicyPage, { generateMetadata } from './page';

describe('cookie policy page', () => {
  beforeEach(() => {
    mockGetLocaleFromCookies.mockClear();
    mockGetLocaleMessages.mockClear();
    mockGetMetadata.mockClear();
    mockHeaders.mockClear();
  });

  it('renders the cookie policy page content', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockHeaders.mockResolvedValue(new Headers({ 'x-nonce': 'test-nonce' }));
    mockGetLocaleMessages.mockResolvedValue({
      legal: {
        cookiePolicy: {
          title: 'Cookie Policy',
          contentsTitle: 'Contents',
          lastUpdated: 'Last updated:',
          lastUpdatedDate: '2026-07-26',
          whatAreCookies: {
            title: 'What are cookies?',
            content: 'Cookies help.',
          },
          howWeUse: {
            title: 'How we use them',
            content: 'We use them for remember.',
            list: {
              necessaryTitle: 'Necessary',
              necessaryContent: 'Needed',
              functionalityTitle: 'Functionality',
              functionalityContent: 'Better UX',
              performanceTitle: 'Performance',
              performanceContent: 'Faster',
            },
          },
          detailedUsage: {
            title: 'Detailed usage',
            content: 'More details',
            list: ['Item 1'],
          },
          managing: {
            title: 'Managing',
            content: 'You can manage them.',
          },
        },
      },
    });

    const page = await CookiePolicyPage();

    expect(page).toBeTruthy();
    expect(mockGetLocaleFromCookies).toHaveBeenCalledOnce();
    expect(mockGetLocaleMessages).toHaveBeenCalledWith('en-gb');
    expect(mockHeaders).toHaveBeenCalledOnce();
  });

  it('renders nothing when the cookie policy translations are unavailable', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockHeaders.mockResolvedValue(new Headers());
    mockGetLocaleMessages.mockResolvedValue({
      legal: {},
    });

    const page = await CookiePolicyPage();

    expect(page).toBeNull();
  });

  it('builds metadata for the cookie policy page', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({
      title: 'Cookie Policy | Cookbook',
    });

    await generateMetadata();

    expect(mockGetLocaleFromCookies).toHaveBeenCalledOnce();
    expect(mockGetMetadata).toHaveBeenCalledWith('en-gb', 'seo', {
      titleKey: 'cookiePolicyTitle',
      descriptionKey: 'cookiePolicyDescription',
      fallbackTitle: 'Cookie Policy',
      fallbackDescription: 'Learn about how Cookbook uses cookies.',
      canonicalPath: '/cookie-policy',
    });
  });
});
