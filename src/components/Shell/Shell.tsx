'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { FC, PropsWithChildren } from 'react';
import { isAuthRoute } from '@/types/routes';
import AuthButton from '../AuthButton';
import LanguageSelector from '../LanguageSelector';
import Logo from '../Logo';
import Navbar from '../Navbar';

const Shell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = useSession();

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
          <Group gap="xs">
            {!session && !isAuthPage && <AuthButton variant="compact" />}
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
      {!isAuthPage && (
        <AppShell.Navbar>
          <Navbar />
        </AppShell.Navbar>
      )}
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Footer p="md" ml={{ base: 0, sm: isAuthPage ? 0 : 300 }}>
        Footer
      </AppShell.Footer>
    </AppShell>
  );
};

export default Shell;
