import type { LocaleMessages } from '@/types/common';

export const LOCALE_STORAGE_KEY = 'cookbook-locale';

export const getLocaleMessages = async (
  locale: string,
): Promise<LocaleMessages> => {
  try {
    // Use dynamic import to load JSON files from src/locales directory
    const messages = await import(`../../locales/${locale}.json`);
    return messages.default || messages;
  } catch {
    // Fallback to English
    try {
      const messages = await import('../../locales/en-gb.json');
      return messages.default || messages;
    } catch {
      // Ultimate fallback - return empty object
      return {};
    }
  }
};
