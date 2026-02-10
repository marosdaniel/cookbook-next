'use client';

import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import type { FC } from 'react';
import { useEffect } from 'react';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { apolloClient } from '@/lib/apollo/client';
import { store } from '@/lib/store';
import { setLocale } from '@/lib/store/global';
import type { ClientProvidersProps, Locale } from '@/types/common';
import { MetadataProvider } from './MetadataProvider';
import { MantineProviderWrapper } from './mantine/mantine';

const ClientProvidersInner: FC<ClientProvidersProps> = ({
  children,
  messages,
  locale,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (locale) {
      dispatch(setLocale(locale as Locale));
    }
  }, [locale, dispatch]);

  const currentMessages = messages[locale] || messages.en;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={currentMessages}
      timeZone="Europe/Budapest"
    >
      <MantineProviderWrapper>
        <MetadataProvider>{children}</MetadataProvider>
      </MantineProviderWrapper>
    </NextIntlClientProvider>
  );
};

export const ClientProviders: FC<ClientProvidersProps> = (props) => {
  return (
    <SessionProvider>
      <ApolloProviderBase client={apolloClient}>
        <ReduxProvider store={store}>
          <ClientProvidersInner {...props} />
        </ReduxProvider>
      </ApolloProviderBase>
    </SessionProvider>
  );
};

export default ClientProviders;
