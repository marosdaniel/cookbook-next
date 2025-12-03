import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Default messages for server-side rendering
  const messages = (await import(`../locales/en-gb.json`)).default;

  return {
    locale: 'en-gb',
    messages,
    timeZone: 'Europe/Budapest',
  };
});
