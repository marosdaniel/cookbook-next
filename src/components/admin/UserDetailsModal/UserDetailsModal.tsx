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
import RoleBadge from '../RoleBadge';
import UserActionsMenu from '../UserActionsMenu';
import { formatDateTime, getInitials } from '../userDisplay';
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
            {[
              { key: 'id', value: <Code>{user.id}</Code> },
              { key: 'firstName', value: user.firstName },
              { key: 'lastName', value: user.lastName },
              { key: 'userName', value: user.userName },
              { key: 'email', value: user.email },
              { key: 'role', value: t(`roles.${user.role}`) },
              { key: 'locale', value: user.locale },
              { key: 'recipes', value: user.recipeCount },
              { key: 'favorites', value: user.favoriteCount },
              { key: 'ratings', value: user.ratingCount },
              { key: 'followers', value: user.followerCount },
              { key: 'following', value: user.followingCount },
              { key: 'joined', value: formatDateTime(user.joinedAt, locale) },
              { key: 'updated', value: formatDateTime(user.updatedAt, locale) },
            ].map(({ key, value }) => (
              // Each label key under users.details.fields matches the row key.
              <DetailRow
                key={key}
                fieldKey={key}
                label={t(`users.details.fields.${key}`)}
              >
                {value}
              </DetailRow>
            ))}
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
