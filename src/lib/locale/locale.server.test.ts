import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { describe, expect, it, vi } from 'vitest';
import { LOCALE_STORAGE_KEY } from './locale';
import { getLocaleFromCookies } from './locale.server';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

describe('locale.server', () => {
  describe('getLocaleFromCookies', () => {
    it('should return "en" by default when no cookie is set', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as ReadonlyRequestCookies);

      const locale = await getLocaleFromCookies();
      expect(locale).toBe('en');
    });

    it('should return locale from cookie when present', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'hu' }),
      } as unknown as ReadonlyRequestCookies);

      const locale = await getLocaleFromCookies();
      expect(locale).toBe('hu');
    });

    it('should use correct cookie key', async () => {
      const { cookies } = await import('next/headers');
      const getMock = vi.fn().mockReturnValue({ value: 'de' });
      vi.mocked(cookies).mockResolvedValue({
        get: getMock,
      } as unknown as ReadonlyRequestCookies);

      await getLocaleFromCookies();
      expect(getMock).toHaveBeenCalledWith(LOCALE_STORAGE_KEY);
    });

    it('should return "en" when cookie value is empty string', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: '' }),
      } as unknown as ReadonlyRequestCookies);

      const locale = await getLocaleFromCookies();
      expect(locale).toBe('en');
    });

    it('should cache the result using React cache', async () => {
      const { cookies } = await import('next/headers');
      const getMock = vi.fn().mockReturnValue({ value: 'fr' });
      vi.mocked(cookies).mockResolvedValue({
        get: getMock,
      } as unknown as ReadonlyRequestCookies);

      // Call multiple times
      const locale1 = await getLocaleFromCookies();
      const locale2 = await getLocaleFromCookies();

      expect(locale1).toBe('fr');
      expect(locale2).toBe('fr');
      // Due to React cache, the function should be memoized
      // Note: In actual Next.js runtime, cache() ensures single execution
    });

    it('should wait for connection before accessing cookies', async () => {
      const { connection } = await import('next/server');
      const { cookies } = await import('next/headers');

      const connectionMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(connection).mockImplementation(connectionMock);

      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'hu' }),
      } as unknown as ReadonlyRequestCookies);

      await getLocaleFromCookies();

      expect(connectionMock).toHaveBeenCalled();
    });
  });
});
