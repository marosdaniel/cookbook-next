import { Box, Container, Stack, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { getLocaleMessages } from '@/lib/locale/locale';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import type { LegalMessages } from '@/types/common';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
    titleKey: 'privacyPolicyTitle',
    descriptionKey: 'privacyPolicyDescription',
    fallbackTitle: 'Privacy Policy',
    fallbackDescription: 'Learn about how Cookbook protects your privacy.',
  });
}

const PrivacyPolicyPage = async () => {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);
  const legalMessages = messages.legal as unknown as LegalMessages;
  const t = legalMessages?.privacyPolicy;

  if (!t) return null;

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{t.title}</Title>
        <Text size="sm" c="dimmed">
          {t.lastUpdated}
          {new Date().toLocaleDateString(locale)}
        </Text>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.introduction.title}
          </Title>
          <Text>{t.introduction.content}</Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.infoCollect.title}
          </Title>
          <Text>{t.infoCollect.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>{t.infoCollect.list.personalTitle}</strong>{' '}
                {t.infoCollect.list.personalContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>{t.infoCollect.list.usageTitle}</strong>{' '}
                {t.infoCollect.list.usageContent}
              </Text>
            </Box>
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.howUse.title}
          </Title>
          <Text>{t.howUse.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            {t.howUse.list.map((item) => (
              <Box key={item} component="li" mb="xs">
                <Text component="span">{item}</Text>
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.contact.title}
          </Title>
          <Text>{t.contact.content}</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default PrivacyPolicyPage;
