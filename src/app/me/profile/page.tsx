import { Stack, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Password from './Password';
import PersonalData from './PersonalData';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('user');

  return {
    title: t('profileTabTitle'),
  };
}

const ProfilePage = () => {
  const translate = useTranslations('user');

  return (
    <Stack gap="xl">
      <Title order={2}>{translate('profileTabTitle')}</Title>
      <PersonalData />
      <Password />
    </Stack>
  );
};

export default ProfilePage;
