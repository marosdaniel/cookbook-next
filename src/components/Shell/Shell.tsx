'use client';

import { AppShell, Burger, Group, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { FC, PropsWithChildren } from 'react';
import { isAuthRoute, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/types/routes';
import AuthButton from '../buttons/AuthButton';
import Footer from '../Footer';
import { HeaderSearch } from '../HeaderSearch';
import LanguageSelector from '../LanguageSelector';
import { Logo } from '../Logo';
import Navbar from '../Navbar';
import ThemeSwitcher from '../ThemeSwitcher';

const NAVBAR_WIDTH = 300;

const Shell: FC<PropsWithChildren> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const pathname = usePathname() ?? '';
  const { data: session, status } = useSession();
  const isSessionLoading = status === 'loading';

  const isAuthPage = isAuthRoute(pathname);
  const isImmersive = pathname.startsWith(PROTECTED_ROUTES.RECIPES_CREATE);
  const showShellChrome = !isImmersive;

  // Keep auth and immersive page chrome mutually exclusive to avoid conflicting layout rules.
  const shouldShowAuthButton = !isSessionLoading && !session && !isAuthPage;

  return (
    <AppShell
      padding={isImmersive ? 0 : 'md'}
      header={{ height: 60, collapsed: isImmersive }}
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: {
          mobile: !mobileOpened,
          desktop: isAuthPage || isImmersive,
        },
      }}
      withBorder={!isImmersive}
    >
      {showShellChrome && (
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Logo
                variant="icon"
                width={40}
                height={40}
                priority
                withText
                hideTextOnMobile
                href={PUBLIC_ROUTES.HOME}
              />
            </Group>

            <Group
              flex={1}
              justify="center"
              display={{ base: 'none', sm: 'flex' }}
            >
              {!isAuthPage && <HeaderSearch />}
            </Group>

            <Group gap="xs">
              {shouldShowAuthButton ? (
                <AuthButton variant="compact" />
              ) : (
                isSessionLoading && (
                  <Skeleton height={36} width={88} radius="xl" />
                )
              )}
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

      {showShellChrome && (
        <AppShell.Navbar>{!isAuthPage && <Navbar />}</AppShell.Navbar>
      )}

      <AppShell.Main pb={isImmersive ? 0 : { base: 100, md: 60 }}>
        {children}
      </AppShell.Main>

      {showShellChrome && (
        <AppShell.Footer
          h={{ base: 100, md: 60 }}
          ml={{ base: 0, sm: isAuthPage ? 0 : NAVBAR_WIDTH }}
        >
          <Footer />
        </AppShell.Footer>
      )}
    </AppShell>
  );
};

export default Shell;
