'use client';

import { Box, Button, Loader, ScrollArea, Stack } from '@mantine/core';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiBook, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import {
  AUTH_ROUTES,
  isProtectedRoute,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
} from '@/types/routes';
import { UserButtonContent } from '../UserButton/UserButton';
import classes from './Navbar.module.css';
import NavbarLinksGroup from './NavbarLinksGroup/NavbarLinksGroup';

const Navbar: FC = () => {
  const translate = useTranslations('sidebar');
  const authTranslate = useTranslations('auth');
  const { data: session } = useSession() as { data: Session | null };
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const shouldRedirect = isProtectedRoute(pathname);
    startTransition(() => {
      signOut({
        callbackUrl: shouldRedirect ? AUTH_ROUTES.LOGIN : pathname,
      });
    });
  };

  const navData = [
    ...(session
      ? [
          {
            label: <UserButtonContent />,
            initiallyOpened: true,
            links: [
              {
                label: translate('profile'),
                link: PROTECTED_ROUTES.PROFILE as unknown as Route,
              },
              {
                label: translate('myRecipes'),
                link: PROTECTED_ROUTES.RECIPES_MY as unknown as Route,
              },
              {
                label: translate('favorites'),
                link: PROTECTED_ROUTES.RECIPES_FAVORITES as unknown as Route,
              },
              {
                label: translate('friends'),
                link: PROTECTED_ROUTES.FRIENDS as unknown as Route,
              },
            ],
          },
        ]
      : []),
    {
      label: translate('recipes'),
      icon: FiBook,
      initiallyOpened: true,
      links: [
        {
          label: translate('allRecipes'),
          link: PUBLIC_ROUTES.RECIPES as unknown as Route,
        },
        {
          label: translate('latestRecipes'),
          link: PUBLIC_ROUTES.RECIPES_LATEST as unknown as Route,
        },
      ],
    },
    ...(session
      ? [
          {
            label: translate('newRecipe'),
            icon: FiPlusCircle,
            link: PROTECTED_ROUTES.RECIPES_CREATE as unknown as Route,
          },
        ]
      : []),
  ];

  const links = navData.map((item, index) => (
    <NavbarLinksGroup
      {...item}
      key={typeof item.label === 'string' ? item.label : `nav-item-${index}`}
    />
  ));

  return (
    <div className={classes.navbar}>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        {session ? (
          <Stack gap="xs" p="md">
            <Button
              variant="subtle"
              color="red"
              fullWidth
              leftSection={
                isPending ? <Loader size="xs" /> : <FiLogOut size={20} />
              }
              onClick={handleLogout}
              disabled={isPending}
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  fontWeight: 500,
                },
              }}
            >
              {translate('logout')}
            </Button>
          </Stack>
        ) : (
          <Box p="md">
            <Button
              component="a"
              href={AUTH_ROUTES.LOGIN}
              variant="gradient"
              gradient={{ from: 'pink', to: 'violet', deg: 45 }}
              fullWidth
            >
              {authTranslate('login')}
            </Button>
          </Box>
        )}
      </div>
    </div>
  );
};

export default Navbar;
