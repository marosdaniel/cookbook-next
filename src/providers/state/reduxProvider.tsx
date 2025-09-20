import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../../lib/store';
import { Props } from '@/types/common';

export function ReduxProviderWrapper({ children }: Props) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
