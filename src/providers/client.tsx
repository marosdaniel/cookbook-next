'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Provider as ReduxProvider } from 'react-redux';
import { MantineProviderWrapper } from './mantine/mantine';
import { Props } from '@/types/common';
import { getStoredLocale, getLocaleMessages } from '@/lib/locale';
import { store } from '@/lib/store';

export function ClientProviders({
  children,
  messages: initialMessages,
  initialLocale = 'en',
}: Props & { messages: any; initialLocale?: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    const loadLocale = async () => {
      const storedLocale = await getStoredLocale();
      setLocale(storedLocale);

      if (storedLocale !== initialLocale) {
        const localeMessages = await getLocaleMessages(storedLocale);
        setMessages(localeMessages);
      }
    };

    loadLocale();
  }, [initialLocale]);

  return (
    <ReduxProvider store={store}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <MantineProviderWrapper>{children}</MantineProviderWrapper>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}

export default ClientProviders;
