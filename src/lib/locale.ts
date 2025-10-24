import type { LocaleMessages } from '@/types/common';

export const LOCALE_STORAGE_KEY = 'locale';

export const getStoredLocale = (): string => {
  // Try localStorage first (works on both server and client)
  if (globalThis.window !== undefined) {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored) return stored;
    } catch {
      // Ignore localStorage errors
    }
  }

  // Fallback to cookies
  if (globalThis.window !== undefined) {
    try {
      const stored = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${LOCALE_STORAGE_KEY}=`))
        ?.split('=')[1];
      if (stored) return stored;
    } catch {
      // Ignore cookie errors
    }
  }

  return 'en';
};

export const setStoredLocale = (locale: string): void => {
  if (globalThis.window === undefined) return;

  try {
    // Set in localStorage
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    // Set in cookies (expires in 1 year)
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${maxAge}`;
  } catch {
    // Ignore storage errors
  }
};

export const getLocaleMessages = async (
  locale: string,
): Promise<LocaleMessages> => {
  try {
    // Use dynamic import to load JSON files from src/locales directory
    const messages = await import(`../locales/${locale}.json`);
    return messages.default || messages;
  } catch {
    // Fallback to English
    try {
      const messages = await import('../locales/en.json');
      return messages.default || messages;
    } catch {
      // Ultimate fallback - return empty object
      return {};
    }
  }
};
