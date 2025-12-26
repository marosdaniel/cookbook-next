import { Container } from '@mantine/core';
import type { ReactNode } from 'react';

export default function MeLayout({ children }: { children: ReactNode }) {
  return (
    <Container size="lg" py="xl">
      {/* 
          In the future, a sidebar or navigation tabs defined here can link to:
          - /me/profile
          - /me/favorites
      */}
      {children}
    </Container>
  );
}
