import { describe, expect, it, vi } from 'vitest';
import * as locale from '@/lib/locale/locale';
import type { LocaleMessages } from '@/types/common';
import { getAuthMetadata, getMetadata } from './seo';

vi.mock('@/lib/locale/locale', () => ({
  getLocaleMessages: vi.fn(),
}));

describe('getAuthMetadata', () => {
  it('should return metadata with title and description from messages', async () => {
    const mockMessages = {
      auth: {
        login: 'Sign In',
        loginDescription: 'Please enter your credentials',
      },
    };
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      mockMessages as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'login',
      descriptionKey: 'loginDescription',
      fallbackTitle: 'Login',
      fallbackDescription: 'Login page',
    });

    expect(result).toMatchObject({
      title: 'Sign In | Cookbook',
      description: 'Please enter your credentials',
    });
  });

  it('should use fallback values if keys are missing in messages', async () => {
    const mockMessages = {
      auth: {},
    };
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      mockMessages as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'login',
      descriptionKey: 'loginDescription',
      fallbackTitle: 'Default Login',
      fallbackDescription: 'Default Description',
    });

    expect(result).toMatchObject({
      title: 'Default Login | Cookbook',
      description: 'Default Description',
    });
  });

  it('should handle missing auth object in messages', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue(
      {} as unknown as LocaleMessages,
    );

    const result = await getAuthMetadata('en-gb', {
      titleKey: 'createAccount',
      descriptionKey: 'signupDescription',
      fallbackTitle: 'Sign Up',
      fallbackDescription: 'Create account',
    });

    expect(result).toMatchObject({
      title: 'Sign Up | Cookbook',
      description: 'Create account',
    });
  });

  it('uses a custom title template and keywords when provided', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue({
      seo: {
        title: 'Custom Title',
        description: 'Custom Description',
        keywords: 'one, two',
      },
    } as unknown as LocaleMessages);

    const result = await getMetadata('en-gb', 'seo', {
      titleKey: 'title',
      descriptionKey: 'description',
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
      titleTemplate: '%s | My Site',
      keywordsKey: 'keywords',
      fallbackKeywords: 'fallback',
      robots: { index: true, follow: false },
      openGraph: { type: 'article' },
    });

    expect(result).toMatchObject({
      title: 'Custom Title | My Site',
      description: 'Custom Description',
      keywords: 'one, two',
      robots: { index: true, follow: false },
    });
    expect(result.openGraph).toMatchObject({
      title: 'Custom Title | My Site',
      description: 'Custom Description',
      type: 'article',
    });
  });

  it('uses fallback keywords and default openGraph type when omitted', async () => {
    vi.mocked(locale.getLocaleMessages).mockResolvedValue({
      seo: {
        title: 'Title',
        description: 'Description',
      },
    } as unknown as LocaleMessages);

    const result = await getMetadata('en-gb', 'seo', {
      titleKey: 'title',
      descriptionKey: 'description',
      fallbackTitle: 'Fallback Title',
      fallbackDescription: 'Fallback Description',
      fallbackKeywords: 'fallback keywords',
    });

    expect(result).toMatchObject({
      title: 'Title | Cookbook',
      description: 'Description',
      keywords: 'fallback keywords',
    });
    expect(result.openGraph).toMatchObject({
      title: 'Title | Cookbook',
      description: 'Description',
      type: 'website',
    });
  });
});
