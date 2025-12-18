'use client';

import { Avatar, Group, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';

export function UserButtonContent() {
  const { data: session } = useSession();

  if (!session) return null;

  const userName = session.user?.userName || session.user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Group wrap="nowrap">
      <Avatar color="pink" radius="xl">
        {userInitials}
      </Avatar>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} truncate>
          {userName}
        </Text>

        <Text c="dimmed" size="xs" truncate>
          {session.user?.email}
        </Text>
      </div>
    </Group>
  );
}
