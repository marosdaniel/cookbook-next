'use client';

import { ActionIcon, Button, Menu } from '@mantine/core';
import {
  IconArrowBigUpLines,
  IconCheck,
  IconChevronDown,
  IconDotsVertical,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { INSIGHT_USER_ROLES } from '@/types/adminInsights';
import { USER_ACTION_ICON_COLOR } from './consts';
import type { RoleMenuItemsProps, UserActionsMenuProps } from './types';

// The roles a user can be moved to. The current role stays visible, marked
// with a check and disabled.
export const RoleMenuItems = ({
  user,
  testIdPrefix,
  onChangeRole,
}: Readonly<RoleMenuItemsProps>) => {
  const t = useTranslations('adminConsole');

  return (
    <>
      <Menu.Label>{t('users.actions.chooseRole')}</Menu.Label>
      {INSIGHT_USER_ROLES.map((role) => {
        const isCurrent = role === user.role;

        return (
          <Menu.Item
            key={role}
            disabled={isCurrent}
            rightSection={isCurrent ? <IconCheck size={14} /> : null}
            onClick={() => onChangeRole(user, role)}
            data-testid={`${testIdPrefix}-role-option-${role.toLowerCase()}-${user.id}`}
          >
            {t(`roles.${role}`)}
          </Menu.Item>
        );
      })}
    </>
  );
};

const UserActionsMenu = ({
  user,
  currentUserId,
  disabled = false,
  variant = 'icon',
  onChangeRole,
  onDelete,
}: Readonly<UserActionsMenuProps>) => {
  const t = useTranslations('adminConsole');
  const isSelf = user.id === currentUserId;
  const name = `${user.firstName} ${user.lastName}`;
  // The same user can be shown in the table and in the modal at once, so the
  // two variants use different identifiers.
  const testIdPrefix = variant === 'icon' ? 'admin-user' : 'admin-user-details';

  return (
    <Menu position="bottom-end" shadow="md" width={220} disabled={disabled}>
      <Menu.Target>
        {variant === 'icon' ? (
          <ActionIcon
            variant="light"
            color={USER_ACTION_ICON_COLOR}
            size="lg"
            radius="md"
            disabled={disabled}
            aria-label={t('users.actions.open', { name })}
            data-testid={`${testIdPrefix}-actions-${user.id}`}
          >
            <IconDotsVertical size={18} />
          </ActionIcon>
        ) : (
          <Button
            variant="light"
            color={USER_ACTION_ICON_COLOR}
            rightSection={<IconChevronDown size={16} />}
            disabled={disabled}
            data-testid={`${testIdPrefix}-actions-${user.id}`}
          >
            {t('users.actions.button')}
          </Button>
        )}
      </Menu.Target>

      <Menu.Dropdown data-testid={`${testIdPrefix}-actions-menu-${user.id}`}>
        <Menu.Label>
          {isSelf ? t('users.actions.selfHint') : t('users.actions.label')}
        </Menu.Label>

        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item
              leftSection={<IconArrowBigUpLines size={16} />}
              disabled={isSelf}
              data-testid={`${testIdPrefix}-actions-promote-${user.id}`}
            >
              {t('users.actions.promote')}
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown
            data-testid={`${testIdPrefix}-roles-menu-${user.id}`}
          >
            <RoleMenuItems
              user={user}
              testIdPrefix={testIdPrefix}
              onChangeRole={onChangeRole}
            />
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconTrash size={16} />}
          disabled={isSelf}
          onClick={() => onDelete(user)}
          data-testid={`${testIdPrefix}-actions-delete-${user.id}`}
        >
          {t('users.actions.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserActionsMenu;
