'use client';

import {
  Avatar,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCalendarPlus,
  IconChefHat,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import {
  RegistrationsChart,
  RoleDonutChart,
  TopAuthorsChart,
} from '@/components/admin/AdminCharts/AdminCharts';
import { RoleBadge } from '@/components/admin/RoleBadge';
import { StatCard } from '@/components/admin/StatCard';
import { formatJoinedDate, getInitials } from '@/components/admin/userDisplay';
import type { UserOverview } from '@/types/adminInsights';
import { adminUsersRoute } from '@/types/routes';

type PanelProps = {
  title: string;
  testId: string;
  children: ReactNode;
};

const Panel = ({ title, testId, children }: Readonly<PanelProps>) => (
  <Paper
    withBorder
    p="md"
    radius="md"
    shadow="xs"
    h="100%"
    data-testid={testId}
  >
    <Text fw={600} mb="md">
      {title}
    </Text>
    {children}
  </Paper>
);

type DashboardViewProps = {
  overview: UserOverview;
};

const DashboardView = ({ overview }: Readonly<DashboardViewProps>) => {
  const t = useTranslations('adminConsole');
  const locale = useLocale();

  const withRecipesPercent =
    overview.totalUsers > 0
      ? Math.round((overview.usersWithRecipes / overview.totalUsers) * 100)
      : 0;

  const stats = [
    {
      id: 'total',
      label: t('dashboard.stats.totalUsers'),
      hint: t('dashboard.stats.totalUsersHint'),
      value: overview.totalUsers,
      icon: <IconUsers size={22} />,
    },
    {
      id: 'new7',
      label: t('dashboard.stats.newLast7Days'),
      hint: t('dashboard.stats.newLast7DaysHint'),
      value: overview.newUsers7d,
      icon: <IconUserPlus size={22} />,
    },
    {
      id: 'new30',
      label: t('dashboard.stats.newLast30Days'),
      hint: t('dashboard.stats.newLast30DaysHint'),
      value: overview.newUsers30d,
      icon: <IconCalendarPlus size={22} />,
    },
    {
      id: 'withRecipes',
      label: t('dashboard.stats.withRecipes'),
      hint: t('dashboard.stats.withRecipesHint', {
        percent: withRecipesPercent,
      }),
      value: overview.usersWithRecipes,
      icon: <IconChefHat size={22} />,
    },
  ];

  const roleItems = overview.roles.map((item) => ({
    role: item.role,
    count: item.count,
    label: t(`roles.${item.role}`),
  }));

  return (
    <Stack gap="lg" data-testid="admin-dashboard-page">
      <Box>
        <Title order={1} size="h2">
          {t('dashboard.title')}
        </Title>
        <Text c="dimmed" mt={4}>
          {t('dashboard.description')}
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {stats.map((stat, index) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            hint={stat.hint}
            value={stat.value}
            icon={stat.icon}
            locale={locale}
            index={index}
          />
        ))}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Panel
            title={t('dashboard.charts.registrationsTitle')}
            testId="admin-panel-registrations"
          >
            <RegistrationsChart
              data={overview.registrations}
              seriesLabel={t('dashboard.charts.registrationsSeries')}
            />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Panel
            title={t('dashboard.charts.rolesTitle')}
            testId="admin-panel-roles"
          >
            <RoleDonutChart roles={roleItems} total={overview.totalUsers} />
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Panel
            title={t('dashboard.charts.topAuthorsTitle')}
            testId="admin-panel-authors"
          >
            {overview.topAuthors.length > 0 ? (
              <TopAuthorsChart
                data={overview.topAuthors}
                seriesLabel={t('dashboard.charts.topAuthorsSeries')}
              />
            ) : (
              <Text c="dimmed">{t('dashboard.charts.topAuthorsEmpty')}</Text>
            )}
          </Panel>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Panel
            title={t('dashboard.recentUsers.title')}
            testId="admin-panel-recent-users"
          >
            {overview.recentUsers.length > 0 ? (
              <Stack gap="sm">
                {overview.recentUsers.map((user) => (
                  <Group key={user.id} justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="pink" radius="xl" size="md">
                        {getInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          @{user.userName} ·{' '}
                          {formatJoinedDate(user.joinedAt, locale)}
                        </Text>
                      </div>
                    </Group>
                    <RoleBadge
                      role={user.role}
                      label={t(`roles.${user.role}`)}
                    />
                  </Group>
                ))}
                <Button
                  component={Link}
                  href={adminUsersRoute()}
                  variant="light"
                  fullWidth
                  mt="xs"
                >
                  {t('dashboard.recentUsers.viewAll')}
                </Button>
              </Stack>
            ) : (
              <Text c="dimmed">{t('dashboard.recentUsers.empty')}</Text>
            )}
          </Panel>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default DashboardView;
