'use client';

import { NextIntlClientProvider } from 'next-intl';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { getStoredLocale } from '@/lib/locale';
import type { RootState } from '@/lib/store';
import { store } from '@/lib/store';
import { setLocale } from '@/lib/store/global';
import type { ClientProvidersProps } from '@/types/common';
import { MantineProviderWrapper } from './mantine/mantine';

const ClientProvidersInner: FC<ClientProvidersProps> = ({
  children,
  messages,
  locale: initialLocale,
}) => {
  const locale = useSelector((state: RootState) => state.global.locale);
  const currentMessages = messages[locale] || messages.en;

  useEffect(() => {
    const storedLocale = getStoredLocale();
    const localeToSet = storedLocale || initialLocale;
    if (localeToSet !== locale) {
      store.dispatch(setLocale(localeToSet));
    }
  }, [initialLocale, locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={currentMessages}
      timeZone="Europe/Budapest"
      now={new Date()}
    >
      <MantineProviderWrapper>{children}</MantineProviderWrapper>
    </NextIntlClientProvider>
  );
};

export const ClientProviders: FC<ClientProvidersProps> = (props) => {
  return (
    <ReduxProvider store={store}>
      <ClientProvidersInner {...props} />
    </ReduxProvider>
  );
};

export default ClientProviders;
