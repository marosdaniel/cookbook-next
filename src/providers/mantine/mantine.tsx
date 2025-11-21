'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { PropsWithChildren } from 'react';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export function MantineProviderWrapper({
  children,
}: Readonly<PropsWithChildren>) {
  const isDarkMode = false; // Replace with your actual dark mode logic
  return (
    <MantineProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Notifications />
      {children}
    </MantineProvider>
  );
}
