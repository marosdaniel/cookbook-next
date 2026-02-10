import { Box, Container, Stack, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { getLocaleMessages } from '@/lib/locale/locale';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getAuthMetadata } from '@/lib/seo/seo';
import type { LegalMessages } from '@/types/common';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getAuthMetadata(locale, {
    titleKey: 'cookiePolicyTitle',
    descriptionKey: 'cookiePolicyDescription',
    fallbackTitle: 'Cookie Policy',
    fallbackDescription: 'Learn about how Cookbook uses cookies.',
  });
}

const CookiePolicyPage = async () => {
  const locale = await getLocaleFromCookies();
  const messages = await getLocaleMessages(locale);
  const legalMessages = messages.legal as unknown as LegalMessages;
  const t = legalMessages?.cookiePolicy;

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
            {t.whatAreCookies.title}
          </Title>
          <Text>{t.whatAreCookies.content}</Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.howWeUse.title}
          </Title>
          <Text>{t.howWeUse.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>{t.howWeUse.list.necessaryTitle}</strong>{' '}
                {t.howWeUse.list.necessaryContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>{t.howWeUse.list.functionalityTitle}</strong>{' '}
                {t.howWeUse.list.functionalityContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>{t.howWeUse.list.performanceTitle}</strong>{' '}
                {t.howWeUse.list.performanceContent}
              </Text>
            </Box>
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.detailedUsage.title}
          </Title>
          <Text>{t.detailedUsage.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            {t.detailedUsage.list.map((item) => (
              <Box key={item} component="li" mb="xs">
                <Text component="span">{item}</Text>
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {t.managing.title}
          </Title>
          <Text>{t.managing.content}</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default CookiePolicyPage;
