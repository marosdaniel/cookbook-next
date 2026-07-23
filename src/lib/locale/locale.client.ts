'use client';

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale } from './locale';

const getCookieLocale = (): string | null => {
  try {
    const stored = document.cookie
      .split(';')
      .map((row) => row.trim())
      .find((row) => row.startsWith(`${LOCALE_STORAGE_KEY}=`))
      ?.split('=')
      .slice(1)
      .join('=');

    return stored || null;
  } catch {
    return null;
  }
};

export const getStoredLocale = (): string => {
  if (globalThis.window === undefined) return DEFAULT_LOCALE;

  try {
    const localStorageLocale =
      globalThis.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (localStorageLocale) {
      return normalizeLocale(localStorageLocale);
    }

    return normalizeLocale(getCookieLocale()) || DEFAULT_LOCALE;
  } catch {
    return normalizeLocale(getCookieLocale()) || DEFAULT_LOCALE;
  }
};

export const setStoredLocale = (locale: string): void => {
  if (globalThis.window === undefined) return;

  const normalizedLocale = normalizeLocale(locale);

  try {
    globalThis.localStorage.setItem(LOCALE_STORAGE_KEY, normalizedLocale);

    const maxAge = 60 * 60 * 24 * 365;
    // biome-ignore lint/suspicious/noDocumentCookie: We need to set the cookie manually for i18n
    document.cookie = `${LOCALE_STORAGE_KEY}=${normalizedLocale}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch (error) {
    console.error('[setStoredLocale] Error setting locale:', error);
  }
};
