import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function ServerProviders({ children }: Props) {
  // Server-safe providers (none for now, add theme or other SSR-safe providers here)
  return <>{children}</>;
}

export default ServerProviders;
