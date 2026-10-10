'use client';

import {
  Anchor,
  AppShell,
  Breadcrumbs,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTags } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { PropsWithChildren } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from '@/types/routes';

const NAVBAR_WIDTH = 260;

const AdminShell = ({ children }: Readonly<PropsWithChildren>) => {
  const translate = useTranslations('admin');
  const pathname = usePathname() ?? '';
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();

  const isMetadataSection = pathname.startsWith(ADMIN_ROUTES.METADATA);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      data-testid="admin-shell"
    >
      <AppShell.Header data-testid="admin-header">
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label={translate('navToggle')}
            />
            <Breadcrumbs data-testid="admin-breadcrumbs">
              <Anchor component={Link} href={ADMIN_ROUTES.DASHBOARD} size="sm">
                {translate('breadcrumbRoot')}
              </Anchor>
              {isMetadataSection && (
                <Text size="sm" fw={500}>
                  {translate('navMetadata')}
                </Text>
              )}
            </Breadcrumbs>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <ThemeSwitcher />
            <LanguageSelector />
            <Button
              component={Link}
              href={PUBLIC_ROUTES.HOME}
              variant="subtle"
              size="xs"
            >
              {translate('backToSite')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" data-testid="admin-navbar">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="sm">
          {translate('navTitle')}
        </Text>
        <NavLink
          component={Link}
          href={ADMIN_ROUTES.METADATA}
          label={translate('navMetadata')}
          leftSection={<IconTags size={18} />}
          active={isMetadataSection}
          onClick={closeMobile}
          data-testid="admin-nav-metadata"
        />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default AdminShell;
