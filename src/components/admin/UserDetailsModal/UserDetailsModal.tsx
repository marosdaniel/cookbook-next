'use client';

import {
  Avatar,
  Code,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { formatDateTime, getInitials } from '../userDisplay';
import RoleBadge from '../RoleBadge';
import UserActionsMenu from '../UserActionsMenu';
import type { UserDetailsModalProps } from './types';

type DetailRowProps = {
  fieldKey: string;
  label: string;
  children: ReactNode;
};

const DetailRow = ({ fieldKey, label, children }: Readonly<DetailRowProps>) => (
  <Group
    justify="space-between"
    align="flex-start"
    wrap="nowrap"
    data-testid={`admin-user-details-field-${fieldKey}`}
  >
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={500} ta="right" style={{ wordBreak: 'break-word' }}>
      {children}
    </Text>
  </Group>
);

const UserDetailsModal = ({
  user,
  currentUserId,
  busy,
  onClose,
  onChangeRole,
  onDelete,
}: Readonly<UserDetailsModalProps>) => {
  const t = useTranslations('adminConsole');
  const locale = useLocale();

  return (
    <Modal
      opened={user !== null}
      onClose={onClose}
      title={t('users.details.title')}
      centered
      size="lg"
      data-testid="admin-user-details-modal"
    >
      {user ? (
        <Stack gap="md" data-testid="admin-user-details-content">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Avatar
                color="pink"
                radius="xl"
                size="lg"
                data-testid="admin-user-details-avatar"
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              <div>
                <Text fw={600} data-testid="admin-user-details-name">
                  {user.firstName} {user.lastName}
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  data-testid="admin-user-details-username"
                >
                  @{user.userName}
                </Text>
              </div>
            </Group>
            <RoleBadge role={user.role} label={t(`roles.${user.role}`)} />
          </Group>

          <Divider />

          <Stack gap="xs" data-testid="admin-user-details-fields">
            <DetailRow fieldKey="id" label={t('users.details.fields.id')}>
              <Code>{user.id}</Code>
            </DetailRow>
            <DetailRow
              fieldKey="firstName"
              label={t('users.details.fields.firstName')}
            >
              {user.firstName}
            </DetailRow>
            <DetailRow
              fieldKey="lastName"
              label={t('users.details.fields.lastName')}
            >
              {user.lastName}
            </DetailRow>
            <DetailRow
              fieldKey="userName"
              label={t('users.details.fields.userName')}
            >
              {user.userName}
            </DetailRow>
            <DetailRow fieldKey="email" label={t('users.details.fields.email')}>
              {user.email}
            </DetailRow>
            <DetailRow fieldKey="role" label={t('users.details.fields.role')}>
              {t(`roles.${user.role}`)}
            </DetailRow>
            <DetailRow
              fieldKey="locale"
              label={t('users.details.fields.locale')}
            >
              {user.locale}
            </DetailRow>
            <DetailRow
              fieldKey="recipes"
              label={t('users.details.fields.recipes')}
            >
              {user.recipeCount}
            </DetailRow>
            <DetailRow
              fieldKey="favorites"
              label={t('users.details.fields.favorites')}
            >
              {user.favoriteCount}
            </DetailRow>
            <DetailRow
              fieldKey="ratings"
              label={t('users.details.fields.ratings')}
            >
              {user.ratingCount}
            </DetailRow>
            <DetailRow
              fieldKey="followers"
              label={t('users.details.fields.followers')}
            >
              {user.followerCount}
            </DetailRow>
            <DetailRow
              fieldKey="following"
              label={t('users.details.fields.following')}
            >
              {user.followingCount}
            </DetailRow>
            <DetailRow
              fieldKey="joined"
              label={t('users.details.fields.joined')}
            >
              {formatDateTime(user.joinedAt, locale)}
            </DetailRow>
            <DetailRow
              fieldKey="updated"
              label={t('users.details.fields.updated')}
            >
              {formatDateTime(user.updatedAt, locale)}
            </DetailRow>
          </Stack>

          <Divider />

          <Group justify="flex-end" data-testid="admin-user-details-actions">
            <UserActionsMenu
              user={user}
              currentUserId={currentUserId}
              variant="button"
              disabled={busy}
              onChangeRole={onChangeRole}
              onDelete={onDelete}
            />
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
};

export default UserDetailsModal;
