import { Container, List, Stack, Text, Title } from '@mantine/core';

const PrivacyPolicyPage = () => {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>Privacy Policy</Title>
        <Text size="sm" c="dimmed">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        <Stack gap="md">
          <Title order={2} size="h3">
            1. Introduction
          </Title>
          <Text>
            Welcome to Cookbook ("we," "our," or "us"). We are committed to
            protecting your personal information and your right to privacy. If
            you have any questions or concerns about this privacy notice or our
            practices with regard to your personal information, please
            contacting us.
          </Text>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            2. Information We Collect
          </Title>
          <Text>
            We collect personal information that you voluntarily provide to us
            when you register on the website, express an interest in obtaining
            information about us or our products and services, when you
            participate in activities on the website (such as by posting
            messages in our online forums or entering competitions, contests or
            giveaways) or otherwise when you contact us.
          </Text>
          <List withPadding>
            <List.Item>
              Personal Data: Name, email address, passwords, contact data.
            </List.Item>
            <List.Item>
              Usage Data: IP address, browser type, device information.
            </List.Item>
          </List>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            3. How We Use Your Information
          </Title>
          <Text>
            We use personal information collected via our website for a variety
            of business purposes described below. We process your personal
            information for these purposes in reliance on our legitimate
            business interests, in order to enter into or perform a contract
            with you, with your consent, and/or for compliance with our legal
            obligations.
          </Text>
          <List withPadding>
            <List.Item>
              To facilitate account creation and logon process.
            </List.Item>
            <List.Item>To post testimonials.</List.Item>
            <List.Item>To request feedback.</List.Item>
            <List.Item>To enable user-to-user communications.</List.Item>
          </List>
        </Stack>

        <Stack gap="md">
          <Title order={2} size="h3">
            4. Contact Us
          </Title>
          <Text>
            If you have questions or comments about this policy, you may email
            us at support@cookbook.com.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
};

export default PrivacyPolicyPage;
