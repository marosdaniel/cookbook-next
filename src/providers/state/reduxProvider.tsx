import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../../lib/store';

type Props = {
  children: React.ReactNode;
};

export function ReduxProviderWrapper({ children }: Props) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}
