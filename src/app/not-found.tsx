import { Container, Stack, Text, Title } from '@mantine/core';
import { IconChefHat, IconHome } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import NavButton from '../components/buttons/NavButton';
import { PUBLIC_ROUTES } from '../types/routes';
export const dynamic = 'force-dynamic';

const NotFound = () => {
  const translate = useTranslations('notFound');

  return (
    <Container size="sm" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <Stack align="center" gap="xl">
        <IconChefHat
          size={120}
          style={{ opacity: 0.5 }}
          data-testid="icon-chef-hat"
        />

        <Title order={1} size={80} fw={900} data-testid="notfound-title">
          {translate('title')}
        </Title>

        <Stack align="center" gap="xs">
          <Title order={2} size="h3" data-testid="notfound-heading">
            {translate('heading')}
          </Title>
          <Text c="dimmed" size="lg" data-testid="notfound-description">
            {translate('description')}
          </Text>
          <Text c="dimmed" size="sm" data-testid="notfound-hint">
            {translate('hint')}
          </Text>
        </Stack>

        <NavButton
          dataTestId="back-home"
          label={translate('backButton')}
          href={PUBLIC_ROUTES.HOME}
          icon={<IconHome size={20} data-testid="icon-home" />}
          linkProps={{ 'data-testid': 'back-home-link' }}
        />
      </Stack>
    </Container>
  );
};

export default NotFound;
