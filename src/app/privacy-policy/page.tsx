import {
  Anchor,
  Container,
  Divider,
  List,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import ReadingProgress from '@/components/ReadingProgress';
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
    canonicalPath: '/privacy-policy',
  });
}

const PrivacyPolicyPage = async () => {
  const [locale, requestHeaders] = await Promise.all([
    getLocaleFromCookies(),
    headers(),
  ]);

  const messages = await getLocaleMessages(locale);
  const legalMessages = messages.legal as unknown as LegalMessages;
  const privacyPolicyMessages = legalMessages?.privacyPolicy;

  if (!privacyPolicyMessages) return null;

  const lastUpdatedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
  }).format(new Date());

  const nonce = requestHeaders.get('x-nonce') ?? undefined;

  return (
    <>
      <ReadingProgress nonce={nonce} />

      <Container size="md" py={{ base: 'xl', sm: 56 }}>
        <Stack gap="xl">
          <Stack gap="sm" ta="center">
            <Title order={1}>{privacyPolicyMessages.title}</Title>

            <Text c="dimmed" size="sm">
              {privacyPolicyMessages.lastUpdated} {lastUpdatedDate}
            </Text>
          </Stack>

          <Paper
            withBorder
            p={{ base: 'md', sm: 'xl' }}
            radius="md"
            shadow="xs"
          >
            <Stack gap="xl">
              <Stack
                component="nav"
                aria-label={privacyPolicyMessages.title}
                gap="md"
              >
                <Text fw={600} size="sm">
                  {privacyPolicyMessages.contentsTitle}
                </Text>

                <List size="sm" spacing={4} component="ul">
                  <li>
                    <Anchor href="#introduction">
                      {privacyPolicyMessages.introduction.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#info-collect">
                      {privacyPolicyMessages.infoCollect.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#how-use">
                      {privacyPolicyMessages.howUse.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#contact">
                      {privacyPolicyMessages.contact.title}
                    </Anchor>
                  </li>
                </List>
              </Stack>

              <Divider />
              <Stack
                component="section"
                gap="md"
                id="introduction"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {privacyPolicyMessages.introduction.title}
                </Title>
                <Text>{privacyPolicyMessages.introduction.content}</Text>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="info-collect"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {privacyPolicyMessages.infoCollect.title}
                </Title>
                <Text>{privacyPolicyMessages.infoCollect.content}</Text>

                <List spacing="sm" withPadding component="ul">
                  <li>
                    <Text component="span">
                      <strong>
                        {privacyPolicyMessages.infoCollect.list.personalTitle}
                      </strong>{' '}
                      {privacyPolicyMessages.infoCollect.list.personalContent}
                    </Text>
                  </li>

                  <li>
                    <Text component="span">
                      <strong>
                        {privacyPolicyMessages.infoCollect.list.usageTitle}
                      </strong>{' '}
                      {privacyPolicyMessages.infoCollect.list.usageContent}
                    </Text>
                  </li>
                </List>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="how-use"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {privacyPolicyMessages.howUse.title}
                </Title>
                <Text>{privacyPolicyMessages.howUse.content}</Text>

                <List spacing="sm" withPadding component="ul">
                  {privacyPolicyMessages.howUse.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </List>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="contact"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {privacyPolicyMessages.contact.title}
                </Title>
                <Text>{privacyPolicyMessages.contact.content}</Text>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
};

export default PrivacyPolicyPage;
