import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getRequestConfig: vi.fn(),
  getLocaleFromCookies: vi.fn(),
  getLocaleMessages: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getRequestConfig: (callback: () => Promise<unknown>) => {
    mocks.getRequestConfig(callback);
    return callback;
  },
}));

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: mocks.getLocaleFromCookies,
}));

vi.mock('@/lib/locale/locale', () => ({
  getLocaleMessages: mocks.getLocaleMessages,
}));

import requestConfig from './request';

describe('next-intl request config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the normalized cookie locale and matching messages', async () => {
    const messages = { seo: { appTitle: 'Kochbuch' } };
    mocks.getLocaleFromCookies.mockResolvedValue('de');
    mocks.getLocaleMessages.mockResolvedValue(messages);

    await expect(
      requestConfig({ requestLocale: Promise.resolve(undefined) }),
    ).resolves.toEqual({
      locale: 'de',
      messages,
      timeZone: 'Europe/Budapest',
    });

    expect(mocks.getLocaleFromCookies).toHaveBeenCalledOnce();
    expect(mocks.getLocaleMessages).toHaveBeenCalledWith('de');
  });
});
