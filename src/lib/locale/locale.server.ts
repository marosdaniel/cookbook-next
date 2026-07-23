import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { cache } from 'react';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale } from './locale';

export const getLocaleFromCookies = cache(async () => {
  await connection();
  const cookieStore = await cookies();
  return (
    normalizeLocale(cookieStore.get(LOCALE_STORAGE_KEY)?.value) ||
    DEFAULT_LOCALE
  );
});
