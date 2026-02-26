import { Box, Container, Stack, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { getLocaleMessages } from '@/lib/locale/locale';
import { getLocaleFromCookies } from '@/lib/locale/locale.server';
import { getMetadata } from '@/lib/seo/seo';
import type { LegalMessages } from '@/types/common';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies();
  return getMetadata(locale, 'seo', {
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
  const cookiePolicyMessage = legalMessages?.cookiePolicy;

  if (!cookiePolicyMessage) return null;

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{cookiePolicyMessage.title}</Title>
        <Text size="sm" c="dimmed">
          {cookiePolicyMessage.lastUpdated}
          {new Date().toLocaleDateString(locale)}
        </Text>

        <Stack gap="md">
          <Title order={2} size="h3">
            {cookiePolicyMessage.whatAreCookies.title}
          </Title>
          <Text>{cookiePolicyMessage.whatAreCookies.content}</Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {cookiePolicyMessage.howWeUse.title}
          </Title>
          <Text>{cookiePolicyMessage.howWeUse.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>
                  {cookiePolicyMessage.howWeUse.list.necessaryTitle}
                </strong>{' '}
                {cookiePolicyMessage.howWeUse.list.necessaryContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>
                  {cookiePolicyMessage.howWeUse.list.functionalityTitle}
                </strong>{' '}
                {cookiePolicyMessage.howWeUse.list.functionalityContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>
                  {cookiePolicyMessage.howWeUse.list.performanceTitle}
                </strong>{' '}
                {cookiePolicyMessage.howWeUse.list.performanceContent}
              </Text>
            </Box>
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {cookiePolicyMessage.detailedUsage.title}
          </Title>
          <Text>{cookiePolicyMessage.detailedUsage.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            {cookiePolicyMessage.detailedUsage.list.map((item) => (
              <Box key={item} component="li" mb="xs">
                <Text component="span">{item}</Text>
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {cookiePolicyMessage.managing.title}
          </Title>
          <Text>{cookiePolicyMessage.managing.content}</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default CookiePolicyPage;
