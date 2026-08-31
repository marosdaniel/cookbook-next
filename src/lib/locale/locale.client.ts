'use client';

import {
  buildLocaleCookieHeader,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  readLocaleCookieValue,
} from './locale';

const getCookieLocale = (): string | null => {
  try {
    return readLocaleCookieValue(document.cookie);
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

    const isSecure = globalThis.location?.protocol === 'https:';
    // biome-ignore lint/suspicious/noDocumentCookie: We need to set the cookie manually for i18n
    document.cookie = buildLocaleCookieHeader(normalizedLocale, isSecure);
  } catch (error) {
    console.error('[setStoredLocale] Error setting locale:', error);
  }
};
