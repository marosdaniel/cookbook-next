'use client';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { type FC, useTransition } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { isProtectedRoute } from '@/types/routes';

const Navbar: FC = () => {
  const t = useTranslations('sidebar');
  const { data: session } = useSession() as { data: Session | null };
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    // Only redirect to login if user is on a protected route
    const shouldRedirect = isProtectedRoute(pathname);
    startTransition(() => {
      signOut({
        callbackUrl: shouldRedirect ? '/login' : pathname,
      });
    });
  };

  const userName = session?.user?.userName || session?.user?.email || '';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Stack h="100%" gap={0}>
      {/* User info section - only for authenticated users */}
      {session && (
        <>
          <Box p="md">
            <Group gap="sm">
              <Avatar color="pink" radius="xl" size="md">
                {userInitials}
              </Avatar>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>
                  {userName}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {session.user?.email}
                </Text>
              </Box>
            </Group>
          </Box>
          <Divider />
        </>
      )}

      {/* Public navigation section - visible to everyone */}
      <Box p="md" style={{ flex: 1 }}>
        {/* Public navigation items */}
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Public navigation items (e.g., Recipes) will go here
          </Text>
        </Stack>

        {/* Authenticated-only navigation items */}
        {session && (
          <>
            <Divider my="md" />
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Authenticated navigation items (e.g., My Recipes, Profile) will
                go here
              </Text>
            </Stack>
          </>
        )}
      </Box>

      {/* Logout section - only for authenticated users */}
      {session && (
        <Box>
          <Divider />
          <Box p="md">
            {isPending ? (
              <Group justify="center">
                <Loader size="md" type="dots" />
              </Group>
            ) : (
              <Button
                variant="subtle"
                color="red"
                fullWidth
                leftSection={<FiLogOut size={20} />}
                onClick={handleLogout}
                styles={(theme) => ({
                  root: {
                    justifyContent: 'flex-start',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: theme.colors.red[0],
                    },
                  },
                })}
              >
                {t('logout')}
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default Navbar;
