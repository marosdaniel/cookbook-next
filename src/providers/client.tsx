'use client';

import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react';
import { NextIntlClientProvider } from 'next-intl';
import type { FC } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { apolloClient } from '@/lib/apollo/client';
import { store } from '@/lib/store';
import { useLocale } from '@/lib/store/global';
import type { ClientProvidersProps } from '@/types/common';
import { MantineProviderWrapper } from './mantine/mantine';

const ClientProvidersInner: FC<ClientProvidersProps> = ({
  children,
  messages,
}) => {
  const locale = useLocale();
  const currentMessages = messages[locale] || messages.en;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={currentMessages}
      timeZone="Europe/Budapest"
    >
      <MantineProviderWrapper>{children}</MantineProviderWrapper>
    </NextIntlClientProvider>
  );
};

export const ClientProviders: FC<ClientProvidersProps> = (props) => {
  return (
    <ApolloProviderBase client={apolloClient}>
      <ReduxProvider store={store}>
        <ClientProvidersInner {...props} />
      </ReduxProvider>
    </ApolloProviderBase>
  );
};

export default ClientProviders;
