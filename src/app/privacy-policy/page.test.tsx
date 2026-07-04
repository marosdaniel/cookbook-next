import { describe, expect, it, vi } from 'vitest';

const { mockGetLocaleFromCookies, mockGetLocaleMessages, mockGetMetadata } = vi.hoisted(() => ({
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

import PrivacyPolicyPage, { generateMetadata } from './page';

describe('privacy policy page', () => {
  it('renders the privacy policy page content', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetLocaleMessages.mockResolvedValue({
      legal: {
        privacyPolicy: {
          title: 'Privacy Policy',
          lastUpdated: 'Updated',
          introduction: { title: 'Introduction', content: 'Intro' },
          infoCollect: {
            title: 'Info collect',
            content: 'We collect data',
            list: {
              personalTitle: 'Personal',
              personalContent: 'Name',
              usageTitle: 'Usage',
              usageContent: 'Usage data',
            },
          },
          howUse: { title: 'How we use', content: 'We use data', list: ['Item 1'] },
          contact: { title: 'Contact', content: 'Contact us' },
        },
      },
    });

    const page = await PrivacyPolicyPage();

    expect(page).toBeTruthy();
  });

  it('builds metadata for the privacy policy page', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({ title: 'Privacy Policy | Cookbook' });

    await generateMetadata();

    expect(mockGetMetadata).toHaveBeenCalled();
  });
});
