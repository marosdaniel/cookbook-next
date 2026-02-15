'use client';

import { Stack, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import Password from './Password';
import PersonalData from './PersonalData';

export default function ProfileClient() {
  const t = useTranslations('user');

  return (
    <Stack gap="xl">
      <Title order={2}>{t('profileTabTitle')}</Title>
      <PersonalData />
      <Password />
    </Stack>
  );
}
