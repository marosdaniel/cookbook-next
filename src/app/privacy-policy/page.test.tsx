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

vi.mock('@/components/ReadingProgress', () => ({
  default: () => null,
}));

import PrivacyPolicyPage, { generateMetadata } from './page';

describe('privacy policy page', () => {
  beforeEach(() => {
    mockGetLocaleFromCookies.mockClear();
    mockGetLocaleMessages.mockClear();
    mockGetMetadata.mockClear();
    mockHeaders.mockClear();
  });

  it('renders the privacy policy page content', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockHeaders.mockResolvedValue(new Headers({ 'x-nonce': 'test-nonce' }));
    mockGetLocaleMessages.mockResolvedValue({
      legal: {
        privacyPolicy: {
          title: 'Privacy Policy',
          contentsTitle: 'Contents',
          lastUpdated: 'Last updated:',
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
          howUse: {
            title: 'How we use',
            content: 'We use data',
            list: ['Item 1'],
          },
          contact: { title: 'Contact', content: 'Contact us' },
        },
      },
    });

    const page = await PrivacyPolicyPage();

    expect(page).toBeTruthy();
    expect(mockGetLocaleFromCookies).toHaveBeenCalledOnce();
    expect(mockGetLocaleMessages).toHaveBeenCalledWith('en-gb');
    expect(mockHeaders).toHaveBeenCalledOnce();
  });

  it('builds metadata for the privacy policy page', async () => {
    mockGetLocaleFromCookies.mockResolvedValue('en-gb');
    mockGetMetadata.mockResolvedValue({ title: 'Privacy Policy | Cookbook' });

    await generateMetadata();

    expect(mockGetMetadata).toHaveBeenCalled();
  });
});
