import { describe, expect, it } from 'vitest';
import {
  getLocaleMessages,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
} from './locale';

describe('locale', () => {
  describe('LOCALE_STORAGE_KEY', () => {
    it('should have the correct value', () => {
      expect(LOCALE_STORAGE_KEY).toBe('cookbook-locale');
    });
  });

  describe('normalizeLocale', () => {
    it('normalizes browser-style and underscored locales to supported values', () => {
      expect(normalizeLocale('en_US')).toBe('en-gb');
      expect(normalizeLocale('en-US')).toBe('en-gb');
      expect(normalizeLocale('en')).toBe('en-gb');
      expect(normalizeLocale('de_DE')).toBe('de');
      expect(normalizeLocale('hu-HU')).toBe('hu');
    });

    it('falls back to English for unsupported locales', () => {
      expect(normalizeLocale('fr-FR')).toBe('en-gb');
    });
  });

  describe('getLocaleMessages', () => {
    describe('successful loading', () => {
      it.each([
        ['English', 'en-gb'],
        ['Hungarian', 'hu'],
        ['German', 'de'],
      ])('should load %s messages', async (_name, locale) => {
        const messages = await getLocaleMessages(locale);
        expect(messages).toBeDefined();
        expect(typeof messages).toBe('object');
      });
    });

    describe('fallback behavior', () => {
      it('should fall back to English for unknown locale', async () => {
        const messages = await getLocaleMessages('unknown-locale');
        expect(messages).toBeDefined();
        expect(typeof messages).toBe('object');
      });
    });
  });
});
