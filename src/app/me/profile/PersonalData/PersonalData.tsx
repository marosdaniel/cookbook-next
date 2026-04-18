'use client';

import { useMutation } from '@apollo/client/react';
import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPencil, IconUser } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { z } from 'zod';
import { UPDATE_USER } from '@/lib/graphql/mutations';
import { isFormSubmitDisabled, nameValidationSchema } from '@/lib/validation';
import { zodResolver } from '@/lib/validation/zodResolver';
import type { ProfileUser } from '../ProfileClient';

interface PersonalDataProps {
  user: ProfileUser | undefined;
  loading: boolean;
  refetch: () => Promise<unknown>;
}

interface UpdateUserData {
  updateUser: {
    success: boolean;
    message: string;
    user?: { id: string; firstName: string; lastName: string };
  };
}

const InfoField = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading?: boolean;
}) => (
  <Stack gap={2}>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
      {label}
    </Text>
    {isLoading ? (
      <Skeleton h={20} w="70%" />
    ) : (
      <Text size="sm" fw={500}>
        {value}
      </Text>
    )}
  </Stack>
);

const PersonalData = ({ user, loading, refetch }: PersonalDataProps) => {
  const translate = useTranslations();
  const [isEditMode, setIsEditMode] = useState(false);

  const [updateUser, { loading: updateLoading }] =
    useMutation<UpdateUserData>(UPDATE_USER);

  const form = useForm<z.infer<typeof nameValidationSchema>>({
    mode: 'controlled',
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    },
    validate: zodResolver(nameValidationSchema),
    validateInputOnBlur: true,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Mantine form methods are unstable references; adding them causes an infinite re-render loop
  useEffect(() => {
    if (user) {
      form.setValues({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      form.resetDirty({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user]);

  const onSubmit = async (values: z.infer<typeof nameValidationSchema>) => {
    try {
      const { data } = await updateUser({
        variables: {
          userUpdateInput: {
            firstName: values.firstName,
            lastName: values.lastName,
          },
        },
      });

      if (data?.updateUser?.success) {
        await refetch();
        setIsEditMode(false);
        notifications.show({
          title: translate('response.success'),
          message: translate('notifications.personalDataUpdatedMessage'),
          color: 'teal',
        });
      } else {
        notifications.show({
          title: translate('response.error'),
          message:
            data?.updateUser?.message ?? translate('response.unknownError'),
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

  const handleCancel = () => {
    form.reset();
    setIsEditMode(false);
  };

  const isInitialLoading = loading && !user;

  return (
    <Paper
      component="form"
      onSubmit={form.onSubmit(onSubmit)}
      shadow="sm"
      radius="lg"
      p={{ base: 'md', md: 'xl' }}
      pos="relative"
    >
      <LoadingOverlay visible={updateLoading} />

      <Group mb="lg" justify="space-between" align="center">
        <Group gap="xs">
          <IconUser size={20} stroke={1.5} />
          <Title order={4}>{translate('user.personalDataTitle')}</Title>
        </Group>
        {!isEditMode && !isInitialLoading && (
          <Tooltip label={translate('general.edit')}>
            <ActionIcon
              variant="subtle"
              color="pink"
              onClick={() => setIsEditMode(true)}
              aria-label={translate('general.edit')}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {isEditMode ? (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              required
              label={translate('user.firstName')}
              placeholder={translate('user.firstName')}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              required
              label={translate('user.lastName')}
              placeholder={translate('user.lastName')}
              {...form.getInputProps('lastName')}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <InfoField
              label={translate('user.email')}
              value={user?.email ?? ''}
            />
            <InfoField
              label={translate('user.userName')}
              value={`@${user?.userName ?? ''}`}
            />
          </SimpleGrid>

          <Group mt="sm" justify="flex-end">
            <Button variant="default" size="sm" onClick={handleCancel}>
              {translate('general.cancel')}
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isFormSubmitDisabled(form, updateLoading)}
              loading={updateLoading}
              loaderProps={{ type: 'dots' }}
            >
              {translate('general.save')}
            </Button>
          </Group>
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <InfoField
            label={translate('user.firstName')}
            value={user?.firstName ?? ''}
            isLoading={isInitialLoading}
          />
          <InfoField
            label={translate('user.lastName')}
            value={user?.lastName ?? ''}
            isLoading={isInitialLoading}
          />
          <InfoField
            label={translate('user.email')}
            value={user?.email ?? ''}
            isLoading={isInitialLoading}
          />
          <InfoField
            label={translate('user.userName')}
            value={user ? `@${user.userName}` : ''}
            isLoading={isInitialLoading}
          />
        </SimpleGrid>
      )}
    </Paper>
  );
};

export default PersonalData;
