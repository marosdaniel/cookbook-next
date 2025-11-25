'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import NextTopLoader from 'nextjs-toploader';
import type { PropsWithChildren } from 'react';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export function MantineProviderWrapper({
  children,
}: Readonly<PropsWithChildren>) {
  const isDarkMode = false; // Replace with your actual dark mode logic
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <NextTopLoader
        color={theme.colors?.[theme.primaryColor ?? 'pink']?.[7] ?? '#E00890'}
        showSpinner={false}
        height={2}
        // delay={200}
        // speed={200}
        // crawlSpeed={200}
        crawl={true}
        easing="ease-in-out"
        key="top-loader"
        // nonce=''
      />
      {children}
    </MantineProvider>
  );
}
