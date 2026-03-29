'use client';

import { useQuery } from '@apollo/client/react';
import {
  Avatar,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { GET_USER_BY_ID } from '@/lib/graphql/queries';
import AccountInfo from './AccountInfo';
import Password from './Password';
import PersonalData from './PersonalData';

export interface ProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

interface GetUserData {
  getUserById: ProfileUser;
}

const ProfileClient = () => {
  const translate = useTranslations();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const {
    data: userData,
    loading,
    refetch,
  } = useQuery<GetUserData>(GET_USER_BY_ID, {
    variables: { id: userId ?? '' },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const user = userData?.getUserById;
  const firstName = user?.firstName ?? session?.user?.firstName ?? '';
  const lastName = user?.lastName ?? session?.user?.lastName ?? '';
  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`
      : firstName.charAt(0) || '?';
  const isSessionLoading = status === 'loading';
  const isInitialLoading = isSessionLoading || (loading && !user);

  if (isSessionLoading) {
    return (
      <Stack gap="lg">
        <Paper shadow="sm" radius="lg" p={{ base: 'md', md: 'xl' }}>
          <Group gap="lg" wrap="nowrap">
            <Skeleton circle h={72} w={72} />
            <Stack gap={4}>
              <Skeleton h={28} w={200} />
              <Skeleton h={16} w={280} />
            </Stack>
          </Group>
        </Paper>
        <Skeleton h={200} radius="lg" />
        <Skeleton h={200} radius="lg" />
        <Skeleton h={200} radius="lg" />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Paper shadow="sm" radius="lg" p={{ base: 'md', md: 'xl' }}>
        <Group gap="lg" wrap="nowrap">
          {isInitialLoading ? (
            <Skeleton circle h={72} w={72} />
          ) : (
            <Avatar
              size={72}
              radius="xl"
              color="pink"
              variant="filled"
              alt={`${firstName} ${lastName}`}
            >
              {initials.toUpperCase()}
            </Avatar>
          )}
          <Stack gap={4}>
            {isInitialLoading ? (
              <>
                <Skeleton h={28} w={200} />
                <Skeleton h={16} w={280} />
              </>
            ) : (
              <>
                <Title order={2}>
                  {translate('user.profileGreeting', { firstName })}
                </Title>
                <Text size="sm" c="dimmed">
                  {translate('user.profileSubtitle')}
                </Text>
              </>
            )}
          </Stack>
        </Group>
      </Paper>

      <PersonalData user={user} loading={loading} refetch={refetch} />
      <AccountInfo user={user} loading={loading} />
      <Password />
    </Stack>
  );
};

export default ProfileClient;
