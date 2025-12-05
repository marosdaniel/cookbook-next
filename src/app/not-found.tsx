import { Button, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FiHome } from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <Container size="sm" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <Stack align="center" gap="xl">
        <GiChefToque size={120} style={{ opacity: 0.3 }} />

        <Title order={1} size={80} fw={900}>
          {t('title')}
        </Title>

        <Stack align="center" gap="xs">
          <Title order={2} size="h3">
            {t('heading')}
          </Title>
          <Text c="dimmed" size="lg">
            {t('description')}
          </Text>
          <Text c="dimmed" size="sm">
            {t('hint')}
          </Text>
        </Stack>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button
            size="lg"
            leftSection={<FiHome size={20} />}
            variant="gradient"
            gradient={{ from: 'orange', to: 'red', deg: 45 }}
          >
            {t('backButton')}
          </Button>
        </Link>
      </Stack>
    </Container>
  );
}
