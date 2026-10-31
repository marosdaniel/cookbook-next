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
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import DeleteUserModal from '@/components/admin/DeleteUserModal';
import RoleBadge from '@/components/admin/RoleBadge';
import UserActionsMenu from '@/components/admin/UserActionsMenu';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import { formatJoinedDate, getInitials } from '@/components/admin/userDisplay';
import { INSIGHT_USER_ROLES } from '@/types/adminInsights';
import { ADMIN_ROUTES, adminUsersRoute } from '@/types/routes';
import type { UsersViewProps } from './types';
import { useUserActions } from './useUserActions';

const UsersView = ({ result, currentUserId }: Readonly<UsersViewProps>) => {
  const t = useTranslations('adminConsole');
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const actions = useUserActions(() => setSelectedId(null));

  // Derived from the current list, so the modal follows the refreshed data and
  // closes by itself when the user disappears (for example after a deletion).
  const selectedUser =
    result.users.find((user) => user.id === selectedId) ?? null;

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
      <Box data-testid="admin-users-header">
        <Title order={1} size="h2" data-testid="admin-users-title">
          {t('users.title')}
        </Title>
        <Text c="dimmed" mt={4} data-testid="admin-users-description">
          {t('users.description')}
        </Text>
      </Box>

      <Paper
        withBorder
        p="md"
        radius="md"
        shadow="xs"
        data-testid="admin-users-filters-panel"
      >
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
              data-testid="admin-users-search-input"
            />
            <NativeSelect
              name="role"
              defaultValue={result.role ?? ''}
              data={roleOptions}
              aria-label={t('users.roleFilterLabel')}
              data-testid="admin-users-role-filter"
            />
            <Button type="submit" data-testid="admin-users-search-submit">
              {t('users.search')}
            </Button>
            {hasFilters ? (
              <Button
                component={Link}
                href={adminUsersRoute()}
                variant="subtle"
                data-testid="admin-users-reset"
              >
                {t('users.reset')}
              </Button>
            ) : null}
          </Group>
        </form>
      </Paper>

      <Paper
        withBorder
        radius="md"
        shadow="xs"
        data-testid="admin-users-table-panel"
      >
        <Table.ScrollContainer minWidth={860} data-testid="admin-users-scroll">
          <Table
            verticalSpacing="sm"
            highlightOnHover
            data-testid="admin-users-table"
          >
            <Table.Thead data-testid="admin-users-table-head">
              <Table.Tr>
                <Table.Th data-testid="admin-users-column-user">
                  {t('users.columns.user')}
                </Table.Th>
                <Table.Th data-testid="admin-users-column-email">
                  {t('users.columns.email')}
                </Table.Th>
                <Table.Th data-testid="admin-users-column-role">
                  {t('users.columns.role')}
                </Table.Th>
                <Table.Th data-testid="admin-users-column-recipes">
                  {t('users.columns.recipes')}
                </Table.Th>
                <Table.Th data-testid="admin-users-column-joined">
                  {t('users.columns.joined')}
                </Table.Th>
                <Table.Th ta="right" data-testid="admin-users-column-actions">
                  {t('users.columns.actions')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody data-testid="admin-users-table-body">
              {result.users.map((user) => (
                <Table.Tr
                  key={user.id}
                  onClick={() => setSelectedId(user.id)}
                  style={{ cursor: 'pointer' }}
                  data-testid={`admin-user-row-${user.id}`}
                >
                  <Table.Td data-testid={`admin-user-cell-name-${user.id}`}>
                    {/* The row itself is clickable for mouse users; this button
                        makes the details reachable with the keyboard. */}
                    <UnstyledButton
                      onClick={() => setSelectedId(user.id)}
                      aria-haspopup="dialog"
                      style={{ textAlign: 'left' }}
                      data-testid={`admin-user-open-${user.id}`}
                    >
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
                    </UnstyledButton>
                  </Table.Td>
                  <Table.Td data-testid={`admin-user-email-${user.id}`}>
                    <Text size="sm">{user.email}</Text>
                  </Table.Td>
                  <Table.Td data-testid={`admin-user-role-${user.id}`}>
                    <RoleBadge
                      role={user.role}
                      label={t(`roles.${user.role}`)}
                    />
                  </Table.Td>
                  <Table.Td data-testid={`admin-user-recipes-${user.id}`}>
                    <Text size="sm">{user.recipeCount}</Text>
                  </Table.Td>
                  <Table.Td data-testid={`admin-user-joined-${user.id}`}>
                    <Text size="sm">
                      {formatJoinedDate(user.joinedAt, locale)}
                    </Text>
                  </Table.Td>
                  {/* Clicks here (also the ones coming from the portal rendered
                      menu) must not open the details modal. */}
                  <Table.Td
                    ta="right"
                    onClick={(event) => event.stopPropagation()}
                    data-testid={`admin-user-actions-cell-${user.id}`}
                  >
                    <UserActionsMenu
                      user={user}
                      currentUserId={currentUserId}
                      disabled={actions.isPending}
                      onChangeRole={actions.changeRole}
                      onDelete={actions.requestDelete}
                    />
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

      <Group
        justify="space-between"
        wrap="wrap"
        data-testid="admin-users-pagination"
      >
        <Text size="sm" c="dimmed" data-testid="admin-users-summary">
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
              data-testid="admin-users-prev"
            >
              {t('users.previous')}
            </Button>
          ) : (
            <Button
              disabled
              variant="default"
              size="xs"
              leftSection={<IconChevronLeft size={14} />}
              data-testid="admin-users-prev"
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
              data-testid="admin-users-next"
            >
              {t('users.next')}
            </Button>
          ) : (
            <Button
              disabled
              variant="default"
              size="xs"
              rightSection={<IconChevronRight size={14} />}
              data-testid="admin-users-next"
            >
              {t('users.next')}
            </Button>
          )}
        </Group>
      </Group>

      <UserDetailsModal
        user={selectedUser}
        currentUserId={currentUserId}
        busy={actions.isPending}
        onClose={() => setSelectedId(null)}
        onChangeRole={actions.changeRole}
        onDelete={actions.requestDelete}
      />
      <DeleteUserModal
        user={actions.deleteTarget}
        loading={actions.isPending}
        onConfirm={actions.confirmDelete}
        onCancel={actions.cancelDelete}
      />
    </Stack>
  );
};

export default UsersView;
