import { Button, Container, Group, Text, Title } from '@mantine/core';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <Container style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <Title order={1}>404</Title>
      <Text size="lg" style={{ margin: '1rem 0' }}>
        Page Not Found
      </Text>
      <Text c="dimmed" style={{ marginBottom: '2rem' }}>
        The page you are looking for does not exist.
      </Text>
      <Group justify="center">
        <Link href="/">
          <Button>Go to Homepage</Button>
        </Link>
      </Group>
    </Container>
  );
}
