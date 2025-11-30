'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import type { FC, PropsWithChildren } from 'react';
import { isAuthRoute } from '@/types/routes';
import LanguageSelector from '../LanguageSelector';
import Logo from '../Logo';

const Shell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const pathname = usePathname();

  const isAuthPage = isAuthRoute(pathname);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={
        isAuthPage
          ? undefined
          : {
              width: 300,
              breakpoint: 'sm',
              collapsed: { mobile: !mobileOpened, desktop: false },
            }
      }
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Logo headingSize={2} />
          <Group>
            <LanguageSelector />
            {!isAuthPage && (
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                size="sm"
                display={{ base: 'block', sm: 'none' }}
              />
            )}
          </Group>
        </Group>
      </AppShell.Header>
      {!isAuthPage && <AppShell.Navbar>Navbar</AppShell.Navbar>}
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer>Footer</AppShell.Footer>
    </AppShell>
  );
};

export default Shell;
