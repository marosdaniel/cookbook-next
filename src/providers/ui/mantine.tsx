import React from 'react';
import { MantineProvider } from '@mantine/core';

type Props = {
  children: React.ReactNode;
};

export function MantineProviderWrapper({ children }: Props) {
  return (
    <MantineProvider theme={{ colorScheme: 'light' } as any}>
      {children}
    </MantineProvider>
  );
}
