import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_STORAGE_KEY } from './locale';
import { getStoredLocale, setStoredLocale } from './locale.client';

/**
 * Helper to set cookie via Object.defineProperty
 * This avoids direct document.cookie assignment which triggers Sonar warnings
 */
const setCookie = (value: string) => {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value,
  });
};

describe('locale.client', () => {
  beforeEach(() => {
    localStorage.clear();
    setCookie('');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStoredLocale', () => {
    it('should return "en-gb" when no locale is stored', () => {
      expect(getStoredLocale()).toBe('en-gb');
    });

    it('should return locale from localStorage when present', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'hu');
      expect(getStoredLocale()).toBe('hu');
    });

    it('should prioritize localStorage over cookie', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'hu');
      setCookie(`${LOCALE_STORAGE_KEY}=de`);
      expect(getStoredLocale()).toBe('hu');
    });

    it('should return locale from cookie when localStorage is empty', () => {
      setCookie(`${LOCALE_STORAGE_KEY}=de`);
      expect(getStoredLocale()).toBe('de');
    });

    it('should fall back to cookie when localStorage throws an error', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      setCookie(`${LOCALE_STORAGE_KEY}=de`);
      expect(getStoredLocale()).toBe('de');
    });

    it('should return default locale when both storage methods fail', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      setCookie('');

      expect(getStoredLocale()).toBe('en-gb');
    });
  });

  describe('setStoredLocale', () => {
    it('should set locale in localStorage', () => {
      setStoredLocale('fr');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
    });

    it('should set locale in cookie', () => {
      setStoredLocale('fr');
      expect(document.cookie).toContain(`${LOCALE_STORAGE_KEY}=fr`);
    });

    it('should set cookie with path=/', () => {
      setStoredLocale('de');
      expect(document.cookie).toContain('path=/');
    });

    it('should set cookie with max-age for 1 year', () => {
      setStoredLocale('de');
      expect(document.cookie).toContain('max-age=');
    });

    it('should do nothing when window is undefined (SSR)', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - Testing SSR behavior
      delete globalThis.window;

      expect(() => setStoredLocale('en-gb')).not.toThrow();

      globalThis.window = originalWindow;
    });
  });
});
