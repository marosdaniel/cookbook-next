'use client';

import { useMutation } from '@apollo/client/react';
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLock, IconPencil } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { z } from 'zod';
import { CHANGE_PASSWORD } from '@/lib/graphql/mutations';
import {
  isFormSubmitDisabled,
  passwordEditValidationSchema,
} from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';

const Password = () => {
  const translate = useTranslations();
  const [isEditMode, setIsEditMode] = useState(false);

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

  const form = useForm<z.infer<typeof passwordEditValidationSchema>>({
    mode: 'uncontrolled',
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validate: zodResolver(passwordEditValidationSchema),
    validateInputOnBlur: true,
  });

  const handleCancel = () => {
    form.reset();
    setIsEditMode(false);
  };

  const onSubmit = async (
    values: z.infer<typeof passwordEditValidationSchema>,
  ) => {
    try {
      const { data } = await changePassword({
        variables: {
          passwordEditInput: {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          },
        },
      });

      const changePasswordResult = data?.changePassword;
      const isSuccessfulResponse =
        typeof changePasswordResult === 'boolean'
          ? changePasswordResult
          : Boolean(
              (changePasswordResult as { success?: boolean } | null | undefined)
                ?.success,
            );

      if (isSuccessfulResponse) {
        notifications.show({
          title: translate('response.success'),
          message: translate('notifications.passwordChangedMessage'),
          color: 'teal',
        });
        handleCancel();
      } else {
        const errorMessage =
          typeof changePasswordResult === 'object' &&
          changePasswordResult !== null
            ? (changePasswordResult as { message?: string } | null | undefined)
                ?.message
            : undefined;

        notifications.show({
          title: translate('response.error'),
          message: errorMessage ?? translate('response.unknownError'),
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: translate('response.error'),
        message: translate('response.somethingWentWrong'),
        color: 'red',
      });
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={form.onSubmit(onSubmit)}
      shadow="sm"
      radius="lg"
      p={{ base: 'md', md: 'xl' }}
      data-testid={isEditMode ? 'password-edit' : 'password-view'}
    >
      <Group mb="lg" justify="space-between" align="center">
        <Group gap="xs">
          <IconLock size={20} stroke={1.5} />
          <Title order={4}>{translate('user.securityTitle')}</Title>
        </Group>
        {!isEditMode && (
          <Tooltip label={translate('general.edit')}>
            <ActionIcon
              variant="subtle"
              color="pink"
              onClick={() => setIsEditMode(true)}
              aria-label={translate('general.edit')}
              data-testid="password-edit-button"
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {isEditMode ? (
        <Stack gap="md">
          <PasswordInput
            required
            label={translate('user.currentPassword')}
            placeholder={translate('user.currentPassword')}
            key={form.key('currentPassword')}
            {...form.getInputProps('currentPassword')}
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <PasswordInput
              required
              label={translate('user.newPassword')}
              placeholder={translate('user.newPassword')}
              key={form.key('newPassword')}
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              required
              label={translate('user.confirmPassword')}
              placeholder={translate('user.confirmPassword')}
              key={form.key('confirmNewPassword')}
              {...form.getInputProps('confirmNewPassword')}
            />
          </SimpleGrid>

          <Group mt="sm" justify="flex-end">
            <Button variant="default" size="sm" onClick={handleCancel}>
              {translate('general.cancel')}
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isFormSubmitDisabled(form, loading)}
              loading={loading}
              loaderProps={{ type: 'dots' }}
            >
              {translate('general.save')}
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {translate('user.password')}
          </Text>
          <Text size="sm">••••••••••••</Text>
        </Stack>
      )}
    </Paper>
  );
};

export default Password;
