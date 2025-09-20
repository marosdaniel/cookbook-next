import React from 'react';
import { MantineProvider } from '@mantine/core';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';
import { Props } from '@/types/common';

export function MantineProviderWrapper({ children }: Props) {
  const isDarkMode = false; // Replace with your actual dark mode logic
  return (
    <MantineProvider theme={!isDarkMode ? lightTheme : darkTheme}>
      {children}
    </MantineProvider>
  );
}
