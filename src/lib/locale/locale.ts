import type { LocaleMessages } from '@/types/common';
import deMessages from '../../locales/de.json';
import enGbMessages from '../../locales/en-gb.json';
import huMessages from '../../locales/hu.json';

export const LOCALE_STORAGE_KEY = 'cookbook-locale';
export const DEFAULT_LOCALE = 'en-gb';

const SUPPORTED_LOCALES = new Set(['en-gb', 'hu', 'de']);

const MESSAGES_MAP: Record<string, LocaleMessages> = {
  'en-gb': enGbMessages as unknown as LocaleMessages,
  hu: huMessages as unknown as LocaleMessages,
  de: deMessages as unknown as LocaleMessages,
};

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const readLocaleCookieValue = (
  cookieHeader: string | null | undefined,
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  return (
    cookieHeader
      .split(';')
      .map((row) => row.trim())
      .find((row) => row.startsWith(`${LOCALE_STORAGE_KEY}=`))
      ?.split('=')
      .slice(1)
      .join('=') || null
  );
};

export const getLocaleCookieOptions = (isSecure: boolean = false) => ({
  path: '/',
  maxAge: LOCALE_COOKIE_MAX_AGE,
  sameSite: 'lax' as const,
  secure: isSecure,
});

export const buildLocaleCookieHeader = (
  locale: string,
  isSecure: boolean = false,
): string => {
  const normalizedLocale = normalizeLocale(locale);
  const { path, maxAge, sameSite, secure } = getLocaleCookieOptions(isSecure);

  return `${LOCALE_STORAGE_KEY}=${normalizedLocale}; path=${path}; max-age=${maxAge}; samesite=${sameSite}${secure ? '; secure' : ''}`;
};

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
  return MESSAGES_MAP[normalizedLocale] ?? MESSAGES_MAP['en-gb'] ?? {};
};
