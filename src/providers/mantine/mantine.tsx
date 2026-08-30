'use client';

import {
  localStorageColorSchemeManager,
  MantineProvider,
  useComputedColorScheme,
} from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import NextTopLoader from 'nextjs-toploader';
import type { PropsWithChildren } from 'react';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'cookbook-color-scheme',
});

export const resolveMantineTheme = (colorScheme: 'light' | 'dark') =>
  colorScheme === 'dark' ? darkTheme : lightTheme;

const ThemeAwareProviders = ({ children }: Readonly<PropsWithChildren>) => {
  const colorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });
  const theme = resolveMantineTheme(colorScheme);

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={colorScheme}
      colorSchemeManager={colorSchemeManager}
    >
      <Notifications />
      <NextTopLoader
        color={theme.colors?.[theme.primaryColor ?? 'pink']?.[7] ?? '#E00890'}
        showSpinner={false}
        height={2}
        crawl={true}
        easing="ease-in-out"
        key="top-loader"
      />
      <ModalsProvider>{children}</ModalsProvider>
    </MantineProvider>
  );
};

export const MantineProviderWrapper = ({
  children,
}: Readonly<PropsWithChildren>) => {
  return (
    <MantineProvider
      theme={lightTheme}
      defaultColorScheme="auto"
      colorSchemeManager={colorSchemeManager}
    >
      <ThemeAwareProviders>{children}</ThemeAwareProviders>
    </MantineProvider>
  );
};
