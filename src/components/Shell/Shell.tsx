'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { FC, PropsWithChildren } from 'react';
import { isAuthRoute, PUBLIC_ROUTES } from '@/types/routes';
import AuthButton from '../buttons/AuthButton';
import Footer from '../Footer';
import LanguageSelector from '../LanguageSelector';
import { Logo } from '../Logo';
import Navbar from '../Navbar';
import ThemeSwitcher from '../ThemeSwitcher';

const Shell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAuthPage = isAuthRoute(pathname);
  const isImmersive = pathname?.startsWith('/recipes/create');

  return (
    <AppShell
      padding={isImmersive ? 0 : 'md'}
      header={{ height: 60, collapsed: isImmersive }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          mobile: !mobileOpened,
          desktop: isAuthPage || isImmersive,
        },
      }}
      withBorder={!isImmersive}
    >
      {!isImmersive && (
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Logo
              variant="icon"
              width={40}
              height={40}
              priority
              withText
              hideTextOnMobile
              href={PUBLIC_ROUTES.HOME}
            />
            <Group gap="xs">
              {!session && !isAuthPage && <AuthButton variant="compact" />}
              <ThemeSwitcher />
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
      )}

      {!isImmersive && (
        <AppShell.Navbar>{!isAuthPage && <Navbar />}</AppShell.Navbar>
      )}

      <AppShell.Main pb={isImmersive ? 0 : { base: 100, md: 60 }}>
        {children}
      </AppShell.Main>

      {!isImmersive && (
        <AppShell.Footer
          h={{ base: 100, md: 60 }}
          ml={{ base: 0, sm: isAuthPage ? 0 : 300 }}
        >
          <Footer />
        </AppShell.Footer>
      )}
    </AppShell>
  );
};

export default Shell;
