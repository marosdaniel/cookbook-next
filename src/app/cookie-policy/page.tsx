import { Container, Stack, Text, Title } from '@mantine/core';

const CookiePolicyPage = () => {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>Cookie Policy</Title>
        <Text size="sm" c="dimmed">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Stack gap="md">
          <Title order={2} size="h3">
            1. What Are Cookies?
          </Title>
          <Text>
            Cookies are simple text files that are stored on your computer or
            mobile device by a website's server. Each cookie is unique to your
            web browser. It will contain some anonymous information such as a
            unique identifier, website's domain name, and some digits and
            numbers.
          </Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            2. How We Use Cookies
          </Title>
          <Text>
            We use cookies to improve your browsing experience and to help us
            understand how our website is being used. Some cookies are essential
            for the website to function properly, while others help us to
            improve our services by collecting anonymous information about how
            you use our site.
          </Text>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.75rem 0' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">
                <strong>Necessary Cookies:</strong> These are essential for you to
                browse the website and use its features.
              </Text>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">
                <strong>Functionality Cookies:</strong> Allow the website to
                remember choices you make (such as your user name, language or the
                region you are in).
              </Text>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">
                <strong>Performance Cookies:</strong> Collect information about
                how you use a website, like which pages you visited and which
                links you clicked on. None of this information can be used to
                identify you.
              </Text>
            </li>
          </ul>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            3. Detailed Cookie Usage
          </Title>
          <Text>We may use cookies for the following purposes:</Text>
          <ul style={{ paddingLeft: '1.5rem', margin: '0.75rem 0' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">Authentication and security</Text>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">Preferences and settings</Text>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">Analytics and research</Text>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Text component="span">Advertising</Text>
            </li>
          </ul>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            4. Managing Cookies
          </Title>
          <Text>
            If you want to restrict or block the cookies that are set by our
            website, you can do so through your browser setting. Alternatively,
            you can visit www.internetcookies.com, which contains comprehensive
            information on how to do this on a wide variety of browsers and
            devices.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default CookiePolicyPage;
