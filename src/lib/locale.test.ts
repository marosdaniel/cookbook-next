import { beforeEach, describe, expect, it } from 'vitest';
import { getStoredLocale, LOCALE_STORAGE_KEY, setStoredLocale } from './locale';

describe('locale utils', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = '';
  });

  describe('getStoredLocale', () => {
    it('should return "en" by default', () => {
      expect(getStoredLocale()).toBe('en');
    });

    it('should return locale from localStorage if present', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'hu');
      expect(getStoredLocale()).toBe('hu');
    });

    it('should return locale from cookie if localStorage is empty', () => {
      // Direct assignment to document.cookie is supported in jsdom
      document.cookie = `${LOCALE_STORAGE_KEY}=de`;
      expect(getStoredLocale()).toBe('de');
    });
  });

  describe('setStoredLocale', () => {
    it('should set locale in localStorage and cookie', () => {
      setStoredLocale('fr');
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
      expect(document.cookie).toContain(`${LOCALE_STORAGE_KEY}=fr`);
    });
  });
});
