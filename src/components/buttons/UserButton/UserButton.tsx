'use client';

import { Avatar, Group, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';

const UserButton = () => {
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
      <Avatar color="pink" radius="xl" data-testid="user-initials-avatar">
        <span data-testid="user-initials">{userInitials}</span>
      </Avatar>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} truncate data-testid="user-name">
          {userName}
        </Text>

        <Text c="dimmed" size="xs" truncate data-testid="user-email">
          {session.user?.email}
        </Text>
      </div>
    </Group>
  );
};

export default UserButton;
