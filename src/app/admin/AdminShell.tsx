'use client';

import {
  Anchor,
  AppShell,
  Badge,
  Breadcrumbs,
  Burger,
  Button,
  Group,
  NavLink,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconShieldLock,
  IconTags,
  IconUsers,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { PropsWithChildren } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from '@/types/routes';

const NAVBAR_WIDTH = 260;

const AdminShell = ({ children }: Readonly<PropsWithChildren>) => {
  const translate = useTranslations('adminConsole');
  const pathname = usePathname() ?? '';
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();

  const isDashboard = pathname === ADMIN_ROUTES.DASHBOARD;
  const isUsers = pathname.startsWith(ADMIN_ROUTES.USERS);
  const isMetadata = pathname.startsWith(ADMIN_ROUTES.METADATA);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding={{ base: 'sm', sm: 'lg' }}
      data-testid="admin-shell"
    >
      <AppShell.Header data-testid="admin-header">
        <div
          aria-hidden="true"
          style={{
            height: 3,
            background:
              'linear-gradient(90deg, var(--mantine-color-pink-6), var(--mantine-color-violet-6))',
          }}
        />
        <Group
          h="calc(100% - 3px)"
          px={{ base: 'sm', sm: 'md' }}
          justify="space-between"
          wrap="nowrap"
        >
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              aria-label={translate('navToggle')}
            />
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon
                variant="gradient"
                gradient={{ from: 'pink', to: 'violet', deg: 45 }}
                radius="md"
                size="md"
                aria-hidden="true"
              >
                <IconShieldLock size={17} />
              </ThemeIcon>
              <Breadcrumbs data-testid="admin-breadcrumbs">
                <Anchor
                  component={Link}
                  href={ADMIN_ROUTES.DASHBOARD}
                  size="sm"
                >
                  {translate('consoleTitle')}
                </Anchor>
                {isDashboard ? (
                  <Text size="sm" fw={600}>
                    {translate('dashboard.title')}
                  </Text>
                ) : null}
                {isUsers ? (
                  <Text size="sm" fw={600}>
                    {translate('users.title')}
                  </Text>
                ) : null}
                {isMetadata ? (
                  <Text size="sm" fw={600}>
                    {translate('navMetadata')}
                  </Text>
                ) : null}
              </Breadcrumbs>
              <Badge
                variant="gradient"
                gradient={{ from: 'pink', to: 'violet', deg: 45 }}
                size="sm"
                visibleFrom="sm"
              >
                {translate('adminBadge')}
              </Badge>
            </Group>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <ThemeSwitcher />
            <LanguageSelector />
            <Button
              component={Link}
              href={PUBLIC_ROUTES.HOME}
              variant="subtle"
              size="xs"
              visibleFrom="sm"
            >
              {translate('backToSite')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" data-testid="admin-navbar">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb="xs">
          {translate('navSectionOverview')}
        </Text>
        <NavLink
          component={Link}
          href={ADMIN_ROUTES.DASHBOARD}
          label={translate('dashboard.title')}
          leftSection={<IconDashboard size={18} />}
          active={isDashboard}
          onClick={closeMobile}
          data-testid="admin-nav-dashboard"
          variant="light"
        />

        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mt="lg" mb="xs">
          {translate('navSectionPeople')}
        </Text>
        <NavLink
          component={Link}
          href={ADMIN_ROUTES.USERS}
          label={translate('navUsers')}
          leftSection={<IconUsers size={18} />}
          active={isUsers}
          onClick={closeMobile}
          data-testid="admin-nav-users"
          variant="light"
        />

        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mt="lg" mb="xs">
          {translate('navSectionContent')}
        </Text>
        <NavLink
          component={Link}
          href={ADMIN_ROUTES.METADATA}
          label={translate('navMetadata')}
          leftSection={<IconTags size={18} />}
          active={isMetadata}
          onClick={closeMobile}
          data-testid="admin-nav-metadata"
          variant="light"
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AppShell.Main>
    </AppShell>
  );
};

export default AdminShell;
