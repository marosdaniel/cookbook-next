import { describe, expect, it, vi } from 'vitest';

const { mockGetLocaleFromCookies, mockGetLocaleMessages, mockGetMetadata } =
  vi.hoisted(() => ({
    mockGetLocaleFromCookies: vi.fn(),
    mockGetLocaleMessages: vi.fn(),
    mockGetMetadata: vi.fn(),
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

import CookiePolicyPage, { generateMetadata } from './page';

describe('cookie policy page', () => {
  it('renders the cookie policy page content', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetLocaleMessages.mockResolvedValue({
      legal: {
        cookiePolicy: {
          title: 'Cookie Policy',
          lastUpdated: 'Updated',
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
          managing: { title: 'Managing', content: 'You can manage them.' },
        },
      },
    });

    const page = await CookiePolicyPage();

    expect(page).toBeTruthy();
  });

  it('builds metadata for the cookie policy page', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({ title: 'Cookie Policy | Cookbook' });

    await generateMetadata();

    expect(mockGetMetadata).toHaveBeenCalled();
  });
});
