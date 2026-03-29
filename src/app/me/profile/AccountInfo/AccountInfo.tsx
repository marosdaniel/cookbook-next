'use client';

import {
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { ProfileUser } from '../ProfileClient';

interface AccountInfoProps {
  user: ProfileUser | undefined;
  loading: boolean;
}

const ROLE_BADGE_COLOR: Record<string, string> = {
  ADMIN: 'red',
  BLOGGER: 'violet',
  USER: 'pink',
};

const AccountInfo = ({ user, loading }: AccountInfoProps) => {
  const translate = useTranslations();
  const isLoading = loading && !user;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      user?.locale?.replace('_', '-') ?? 'en-GB',
      { year: 'numeric', month: 'long', day: 'numeric' },
    );
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return translate('user.roleAdmin');
      case 'BLOGGER':
        return translate('user.roleBlogger');
      default:
        return translate('user.roleUser');
    }
  };

  return (
    <Paper shadow="sm" radius="lg" p={{ base: 'md', md: 'xl' }}>
      <Group mb="lg" gap="xs">
        <IconInfoCircle size={20} stroke={1.5} />
        <Title order={4}>{translate('user.accountInfoTitle')}</Title>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {translate('user.role')}
          </Text>
          {isLoading ? (
            <Skeleton h={22} w={80} />
          ) : (
            <Badge
              color={ROLE_BADGE_COLOR[user?.role ?? 'USER']}
              variant="light"
              size="md"
              w="fit-content"
            >
              {getRoleLabel(user?.role ?? 'USER')}
            </Badge>
          )}
        </Stack>

        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {translate('user.memberSince')}
          </Text>
          {isLoading ? (
            <Skeleton h={20} w={140} />
          ) : (
            <Text size="sm" fw={500}>
              {formatDate(user?.createdAt)}
            </Text>
          )}
        </Stack>

        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {translate('user.lastUpdated')}
          </Text>
          {isLoading ? (
            <Skeleton h={20} w={140} />
          ) : (
            <Text size="sm" fw={500}>
              {formatDate(user?.updatedAt)}
            </Text>
          )}
        </Stack>
      </SimpleGrid>
    </Paper>
  );
};

export default AccountInfo;
