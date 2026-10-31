'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { DeleteUserModalProps } from './types';

// Above the user details modal, which can open this one.
const DELETE_MODAL_Z_INDEX = 400;

const DeleteUserModal = ({
  user,
  loading,
  onConfirm,
  onCancel,
}: Readonly<DeleteUserModalProps>) => {
  const t = useTranslations('adminConsole');

  return (
    <Modal
      opened={user !== null}
      onClose={onCancel}
      title={t('users.delete.title')}
      centered
      zIndex={DELETE_MODAL_Z_INDEX}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      data-testid="admin-delete-user-modal"
    >
      {user ? (
        <Stack gap="md" data-testid="admin-delete-user-content">
          <Text data-testid="admin-delete-user-message">
            {t('users.delete.message', {
              name: `${user.firstName} ${user.lastName}`,
              userName: user.userName,
            })}
          </Text>
          <Text size="sm" c="dimmed" data-testid="admin-delete-user-warning">
            {t('users.delete.recipesWarning', { count: user.recipeCount })}
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={onCancel}
              disabled={loading}
              data-testid="admin-delete-user-cancel"
            >
              {t('users.delete.cancel')}
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={loading}
              onClick={() => onConfirm(user)}
              data-testid="admin-delete-user-confirm"
            >
              {t('users.delete.confirm')}
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
};

export default DeleteUserModal;
