'use client';

import { Anchor, Group, Stack, Text } from '@mantine/core';
import Link from 'next/link';
import type { FC } from 'react';
import { PUBLIC_ROUTES } from '../../types/routes';
import { Logo } from '../Logo';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Mobile Footer */}
      <Stack
        h="100%"
        px="md"
        justify="center"
        align="center"
        gap={4}
        hiddenFrom="md"
      >
        <Logo
          variant="icon"
          width={36}
          height={36}
          withText
          href={PUBLIC_ROUTES.HOME}
        />
        <Text size="xs" c="dimmed">
          &copy; {currentYear} Cookbook. All rights reserved.
        </Text>
        <Group gap="md">
          <Anchor
            component={Link}
            href={PUBLIC_ROUTES.PRIVACY_POLICY}
            size="xs"
            c="dimmed"
            underline="hover"
          >
            Privacy Policy
          </Anchor>
          <Anchor
            variant="subtle"
            component={Link}
            href={PUBLIC_ROUTES.COOKIE_POLICY}
            size="xs"
            c="dimmed"
            underline="hover"
          >
            Cookie Policy
          </Anchor>
        </Group>
      </Stack>

      {/* Desktop Footer */}
      <Group
        h="100%"
        justify="space-between"
        align="center"
        px="md"
        visibleFrom="md"
      >
        <Group gap="xs">
          <Logo
            variant="icon"
            width={36}
            height={36}
            withText
            href={PUBLIC_ROUTES.HOME}
          />
          <Text size="xs" c="dimmed">
            &copy; {currentYear} Cookbook. All rights reserved.
          </Text>
        </Group>

        <Group gap="md">
          <Anchor
            component={Link}
            href={PUBLIC_ROUTES.PRIVACY_POLICY}
            size="xs"
            c="dimmed"
            underline="hover"
          >
            Privacy Policy
          </Anchor>
          <Anchor
            component={Link}
            href={PUBLIC_ROUTES.COOKIE_POLICY}
            size="xs"
            c="dimmed"
            underline="hover"
            variant="subtle"
          >
            Cookie Policy
          </Anchor>
        </Group>
      </Group>
    </>
  );
};

export default Footer;
