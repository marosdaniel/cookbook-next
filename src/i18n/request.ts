import { getRequestConfig } from 'next-intl/server';
import { getLocaleMessages } from '@/lib/locale/locale';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';

export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);

  return {
    locale,
    messages,
    timeZone: 'Europe/Budapest',
  };
});
