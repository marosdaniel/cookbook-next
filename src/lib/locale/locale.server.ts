import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { cache } from 'react';
import { LOCALE_STORAGE_KEY } from './locale';

export const getLocaleFromCookies = cache(async () => {
  await connection();
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_STORAGE_KEY)?.value || 'en-gb';
  return locale;
});
