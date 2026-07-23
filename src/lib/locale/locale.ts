import type { LocaleMessages } from '@/types/common';

export const LOCALE_STORAGE_KEY = 'cookbook-locale';
export const DEFAULT_LOCALE = 'en-gb';

const SUPPORTED_LOCALES = new Set(['en-gb', 'hu', 'de']);

export const normalizeLocale = (locale: string | null | undefined): string => {
  const rawLocale = locale?.trim();

  if (!rawLocale) {
    return DEFAULT_LOCALE;
  }

  const normalizedLocale = rawLocale.toLowerCase().replaceAll('_', '-');

  if (SUPPORTED_LOCALES.has(normalizedLocale)) {
    return normalizedLocale;
  }

  const [language] = normalizedLocale.split('-');

  if (language === 'en') {
    return 'en-gb';
  }

  if (language === 'hu') {
    return 'hu';
  }

  if (language === 'de') {
    return 'de';
  }

  return DEFAULT_LOCALE;
};

export const getLocaleMessages = async (
  locale: string,
): Promise<LocaleMessages> => {
  const normalizedLocale = normalizeLocale(locale);

  try {
    // Use dynamic import to load JSON files from src/locales directory
    const messages = await import(`../../locales/${normalizedLocale}.json`);
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
