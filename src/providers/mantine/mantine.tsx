'use client';

import { localStorageColorSchemeManager, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import NextTopLoader from 'nextjs-toploader';
import type { PropsWithChildren } from 'react';
import { lightTheme } from './lightTheme';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'cookbook-color-scheme',
});

export function MantineProviderWrapper({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <MantineProvider
      theme={lightTheme}
      defaultColorScheme="auto"
      colorSchemeManager={colorSchemeManager}
    >
      <Notifications />
      <NextTopLoader
        color={
          lightTheme.colors?.[lightTheme.primaryColor ?? 'pink']?.[7] ??
          '#E00890'
        }
        showSpinner={false}
        height={2}
        crawl={true}
        easing="ease-in-out"
        key="top-loader"
      />
      {children}
    </MantineProvider>
  );
}
