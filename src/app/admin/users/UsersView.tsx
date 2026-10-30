'use client';

import {
  Avatar,
  Box,
  Button,
  Group,
  NativeSelect,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { RoleBadge } from '@/components/admin/RoleBadge';
import { formatJoinedDate, getInitials } from '@/components/admin/userDisplay';
import { INSIGHT_USER_ROLES, type UserListResult } from '@/types/adminInsights';
import { ADMIN_ROUTES, adminUsersRoute } from '@/types/routes';

type UsersViewProps = {
  result: UserListResult;
};

const UsersView = ({ result }: Readonly<UsersViewProps>) => {
  const t = useTranslations('adminConsole');
  const locale = useLocale();

  const roleOptions = [
    { value: '', label: t('users.roleAll') },
    ...INSIGHT_USER_ROLES.map((role) => ({
      value: role,
      label: t(`roles.${role}`),
    })),
  ];

  const hasFilters = Boolean(result.search || result.role);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (result.search) params.set('q', result.search);
    if (result.role) params.set('role', result.role);
    if (page > 1) params.set('page', String(page));

    return adminUsersRoute(params);
  };

  return (
    <Stack gap="lg" data-testid="admin-users-page">
      <Box>
        <Title order={1} size="h2">
          {t('users.title')}
        </Title>
        <Text c="dimmed" mt={4}>
          {t('users.description')}
        </Text>
      </Box>

      <Paper withBorder p="md" radius="md" shadow="xs">
        {/* A plain GET form: the filters live in the URL, so the page is
            shareable and works without client side state. The key remounts the
            inputs when the filters change through navigation. */}
        <form
          key={`${result.search}|${result.role ?? ''}`}
          method="get"
          action={ADMIN_ROUTES.USERS}
          data-testid="admin-users-filters"
        >
          <Group align="flex-end" wrap="wrap">
            <TextInput
              name="q"
              defaultValue={result.search}
              placeholder={t('users.searchPlaceholder')}
              aria-label={t('users.searchLabel')}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1, minWidth: 240 }}
            />
            <NativeSelect
              name="role"
              defaultValue={result.role ?? ''}
              data={roleOptions}
              aria-label={t('users.roleFilterLabel')}
            />
            <Button type="submit">{t('users.search')}</Button>
            {hasFilters ? (
              <Button component={Link} href={ADMIN_ROUTES.USERS} variant="subtle">
                {t('users.reset')}
              </Button>
            ) : null}
          </Group>
        </form>
      </Paper>

      <Paper withBorder radius="md" shadow="xs">
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('users.columns.user')}</Table.Th>
                <Table.Th>{t('users.columns.email')}</Table.Th>
                <Table.Th>{t('users.columns.role')}</Table.Th>
                <Table.Th>{t('users.columns.recipes')}</Table.Th>
                <Table.Th>{t('users.columns.joined')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.users.map((user) => (
                <Table.Tr key={user.id} data-testid={`admin-user-row-${user.id}`}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Avatar color="pink" radius="xl" size="sm">
                        {getInitials(user.firstName, user.lastName)}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          @{user.userName}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{user.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <RoleBadge
                      role={user.role}
                      label={t(`roles.${user.role}`)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{user.recipeCount}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatJoinedDate(user.joinedAt, locale)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {result.users.length === 0 ? (
          <Text c="dimmed" ta="center" p="xl" data-testid="admin-users-empty">
            {t('users.empty')}
          </Text>
        ) : null}
      </Paper>

      <Group justify="space-between" wrap="wrap">
        <Text size="sm" c="dimmed">
          {t('users.summary', {
            total: result.total,
            page: result.page,
            pageCount: result.pageCount,
          })}
        </Text>
        <Group gap="xs">
          {result.page > 1 ? (
            <Button
              component={Link}
              href={buildPageHref(result.page - 1)}
              variant="default"
              size="xs"
              leftSection={<IconChevronLeft size={14} />}
            >
              {t('users.previous')}
            </Button>
          ) : (
            <Button
              disabled
              variant="default"
              size="xs"
              leftSection={<IconChevronLeft size={14} />}
            >
              {t('users.previous')}
            </Button>
          )}
          {result.page < result.pageCount ? (
            <Button
              component={Link}
              href={buildPageHref(result.page + 1)}
              variant="default"
              size="xs"
              rightSection={<IconChevronRight size={14} />}
            >
              {t('users.next')}
            </Button>
          ) : (
            <Button
              disabled
              variant="default"
              size="xs"
              rightSection={<IconChevronRight size={14} />}
            >
              {t('users.next')}
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  );
};

export default UsersView;
