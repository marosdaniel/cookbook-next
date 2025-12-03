'use client';

import { LOCALE_STORAGE_KEY } from './locale';

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

  return 'en-gb';
};

export const setStoredLocale = (locale: string): void => {
  if (globalThis.window === undefined) return;

  try {
    // Set in localStorage
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);

    // Set in cookies (expires in 1 year)
    const maxAge = 60 * 60 * 24 * 365;
    // biome-ignore lint/suspicious/noDocumentCookie: We need to set the cookie manually for i18n
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=${maxAge}`;
  } catch (error) {
    console.error('[setStoredLocale] Error setting locale:', error);
  }
};
