import type { PropsWithChildren } from 'react';

export function ServerProviders({ children }: Readonly<PropsWithChildren>) {
  // Server-safe providers (none for now, add theme or other SSR-safe providers here)
  return <>{children}</>;
}

export default ServerProviders;
