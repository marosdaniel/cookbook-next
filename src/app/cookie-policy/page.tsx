import {
  Anchor,
  Box,
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
    titleKey: 'cookiePolicyTitle',
    descriptionKey: 'cookiePolicyDescription',
    fallbackTitle: 'Cookie Policy',
    fallbackDescription: 'Learn about how Cookbook uses cookies.',
    canonicalPath: '/cookie-policy',
  });
}

const CookiePolicyPage = async () => {
  const [locale, requestHeaders] = await Promise.all([
    getLocaleFromCookies(),
    headers(),
  ]);

  const messages = await getLocaleMessages(locale);
  const legalMessages = messages.legal as unknown as LegalMessages;
  const cookiePolicyMessage = legalMessages?.cookiePolicy;

  if (!cookiePolicyMessage) {
    return null;
  }

  /*
   * Ezt a dátumot a szabályzat tényleges módosításakor kell frissíteni,
   * nem minden oldalbetöltéskor.
   *
   * A locale fájlokban például:
   * "lastUpdatedDate": "2026-07-26"
   */
  const lastUpdatedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
  }).format(new Date(cookiePolicyMessage.lastUpdatedDate));

  /*
   * Ha a proxy.ts más header-nevet használ a nonce továbbítására,
   * itt ahhoz igazítsd.
   */
  const nonce = requestHeaders.get('x-nonce') ?? undefined;

  return (
    <>
      <ReadingProgress nonce={nonce} />

      <Container size="md" py={{ base: 'xl', sm: 56 }}>
        <Stack gap="xl">
          <Stack gap="sm" ta="center">
            <Title order={1}>{cookiePolicyMessage.title}</Title>

            <Text c="dimmed" size="sm">
              {cookiePolicyMessage.lastUpdated} {lastUpdatedDate}
            </Text>
          </Stack>

          <Paper
            withBorder
            p={{ base: 'md', sm: 'xl' }}
            radius="md"
            shadow="xs"
          >
            <Stack gap="xl">
              <Box component="nav" aria-label={cookiePolicyMessage.title}>
                <Text fw={600} mb="xs" size="sm">
                  {cookiePolicyMessage.contentsTitle}
                </Text>

                <List size="sm" spacing={4} component="ul">
                  <li>
                    <Anchor href="#what-are-cookies">
                      {cookiePolicyMessage.whatAreCookies.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#how-we-use-cookies">
                      {cookiePolicyMessage.howWeUse.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#detailed-cookie-usage">
                      {cookiePolicyMessage.detailedUsage.title}
                    </Anchor>
                  </li>

                  <li>
                    <Anchor href="#managing-cookies">
                      {cookiePolicyMessage.managing.title}
                    </Anchor>
                  </li>
                </List>
              </Box>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="what-are-cookies"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {cookiePolicyMessage.whatAreCookies.title}
                </Title>

                <Text>{cookiePolicyMessage.whatAreCookies.content}</Text>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="how-we-use-cookies"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {cookiePolicyMessage.howWeUse.title}
                </Title>

                <Text>{cookiePolicyMessage.howWeUse.content}</Text>

                <List spacing="sm" withPadding component="ul">
                  <li>
                    <Text component="span">
                      <strong>
                        {cookiePolicyMessage.howWeUse.list.necessaryTitle}
                      </strong>{' '}
                      {cookiePolicyMessage.howWeUse.list.necessaryContent}
                    </Text>
                  </li>

                  <li>
                    <Text component="span">
                      <strong>
                        {cookiePolicyMessage.howWeUse.list.functionalityTitle}
                      </strong>{' '}
                      {cookiePolicyMessage.howWeUse.list.functionalityContent}
                    </Text>
                  </li>

                  <li>
                    <Text component="span">
                      <strong>
                        {cookiePolicyMessage.howWeUse.list.performanceTitle}
                      </strong>{' '}
                      {cookiePolicyMessage.howWeUse.list.performanceContent}
                    </Text>
                  </li>
                </List>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="detailed-cookie-usage"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {cookiePolicyMessage.detailedUsage.title}
                </Title>

                <Text>{cookiePolicyMessage.detailedUsage.content}</Text>

                <List spacing="sm" withPadding component="ul">
                  {cookiePolicyMessage.detailedUsage.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </List>
              </Stack>

              <Divider />

              <Stack
                component="section"
                gap="md"
                id="managing-cookies"
                style={{ scrollMarginTop: 24 }}
              >
                <Title order={2} size="h3">
                  {cookiePolicyMessage.managing.title}
                </Title>

                <Text>{cookiePolicyMessage.managing.content}</Text>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
};

export default CookiePolicyPage;
