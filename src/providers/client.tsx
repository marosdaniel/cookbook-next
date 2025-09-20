'use client';

import React from 'react';
import { ReduxProviderWrapper } from './state/reduxProvider';
import { MantineProviderWrapper } from './mantine/mantine';
import { Props } from '@/types/common';

export function ClientProviders({ children }: Props) {
  return (
    <ReduxProviderWrapper>
      <MantineProviderWrapper>{children}</MantineProviderWrapper>
    </ReduxProviderWrapper>
  );
}

export default ClientProviders;
