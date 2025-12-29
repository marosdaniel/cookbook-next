import { describe, expect, it, vi } from 'vitest';
import * as locale from '@/lib/locale/locale';
import type { LocaleMessages } from '@/types/common';
import { getAuthMetadata } from './seo';

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

    expect(result).toEqual({
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

    expect(result).toEqual({
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

    expect(result).toEqual({
      title: 'Sign Up | Cookbook',
      description: 'Create account',
    });
  });
});
