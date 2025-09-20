import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request or default to 'en'
  let locale = await requestLocale;

  // Default to 'en' if no locale is provided
  if (!locale) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
