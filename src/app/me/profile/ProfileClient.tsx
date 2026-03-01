'use client';

import { Stack, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import Password from './Password';
import PersonalData from './PersonalData';

const ProfileClient = () => {
  const translate = useTranslations('user');

  return (
    <Stack gap="xl">
      <Title order={2}>{translate('profileTabTitle')}</Title>
      <PersonalData />
      <Password />
    </Stack>
  );
};

export default ProfileClient;
