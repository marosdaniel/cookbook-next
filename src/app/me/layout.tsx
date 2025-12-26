import { Container } from '@mantine/core';
import type { PropsWithChildren } from 'react';

const MeLayout = ({ children }: Readonly<PropsWithChildren>) => {
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
};

export default MeLayout;
