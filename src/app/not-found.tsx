import { Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

import { useTranslations } from 'next-intl';
import { FiHome } from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';
import NavButton from '../components/buttons/NavButton';
import { PUBLIC_ROUTES } from '../types/routes';

export const dynamic = 'force-dynamic';

const NotFound = () => {
  const translate = useTranslations('notFound');

  return (
    <Container size="sm" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <Stack align="center" gap="xl">
        <GiChefToque size={120} style={{ opacity: 0.5 }} />

        <Title order={1} size={80} fw={900}>
          {translate('title')}
        </Title>

        <Stack align="center" gap="xs">
          <Title order={2} size="h3">
            {translate('heading')}
          </Title>
          <Text c="dimmed" size="lg">
            {translate('description')}
          </Text>
          <Text c="dimmed" size="sm">
            {translate('hint')}
          </Text>
        </Stack>

        <Link href={PUBLIC_ROUTES.HOME} style={{ textDecoration: 'none' }}>
          <NavButton
            label={translate('backButton')}
            href={PUBLIC_ROUTES.HOME}
            icon={<FiHome size={20} />}
          />
        </Link>
      </Stack>
    </Container>
  );
};

export default NotFound;
