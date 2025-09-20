'use client';

import React from 'react';
import { ReduxProviderWrapper } from './state/reduxProvider';
import { MantineProviderWrapper } from './ui/mantine';

type Props = {
  children: React.ReactNode;
};

export function RootProviders({ children }: Props) {
  return (
    <ReduxProviderWrapper>
      <MantineProviderWrapper>{children}</MantineProviderWrapper>
    </ReduxProviderWrapper>
  );
}

export default RootProviders;
