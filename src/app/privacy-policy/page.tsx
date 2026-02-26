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
  const privacyPolicyMessages = legalMessages?.privacyPolicy;

  if (!privacyPolicyMessages) return null;

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{privacyPolicyMessages.title}</Title>
        <Text size="sm" c="dimmed">
          {privacyPolicyMessages.lastUpdated}
          {new Date().toLocaleDateString(locale)}
        </Text>

        <Stack gap="md">
          <Title order={2} size="h3">
            {privacyPolicyMessages.introduction.title}
          </Title>
          <Text>{privacyPolicyMessages.introduction.content}</Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {privacyPolicyMessages.infoCollect.title}
          </Title>
          <Text>{privacyPolicyMessages.infoCollect.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>
                  {privacyPolicyMessages.infoCollect.list.personalTitle}
                </strong>{' '}
                {privacyPolicyMessages.infoCollect.list.personalContent}
              </Text>
            </Box>
            <Box component="li" mb="xs">
              <Text component="span">
                <strong>
                  {privacyPolicyMessages.infoCollect.list.usageTitle}
                </strong>{' '}
                {privacyPolicyMessages.infoCollect.list.usageContent}
              </Text>
            </Box>
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {privacyPolicyMessages.howUse.title}
          </Title>
          <Text>{privacyPolicyMessages.howUse.content}</Text>
          <Box component="ul" pl="xl" mt="xs">
            {privacyPolicyMessages.howUse.list.map((item) => (
              <Box key={item} component="li" mb="xs">
                <Text component="span">{item}</Text>
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            {privacyPolicyMessages.contact.title}
          </Title>
          <Text>{privacyPolicyMessages.contact.content}</Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default PrivacyPolicyPage;
